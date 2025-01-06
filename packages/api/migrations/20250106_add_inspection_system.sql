-- Add new columns to equipment_inspections
ALTER TABLE equipment_inspections
ADD COLUMN IF NOT EXISTS data JSONB,
ADD COLUMN IF NOT EXISTS job_id UUID,
ADD COLUMN IF NOT EXISTS location POINT,
ADD COLUMN IF NOT EXISTS property_id UUID;

-- Create inspection_jobs table
CREATE TABLE IF NOT EXISTS inspection_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id),
    technician_id UUID NOT NULL REFERENCES users(id),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed'))
);

-- Create inspection_job_equipment table
CREATE TABLE IF NOT EXISTS inspection_job_equipment (
    job_id UUID REFERENCES inspection_jobs(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    inspection_id UUID REFERENCES equipment_inspections(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    sequence_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (job_id, equipment_id),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed'))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_equipment_inspections_job_id ON equipment_inspections(job_id);
CREATE INDEX IF NOT EXISTS idx_equipment_inspections_property_id ON equipment_inspections(property_id);
CREATE INDEX IF NOT EXISTS idx_inspection_jobs_property_id ON inspection_jobs(property_id);
CREATE INDEX IF NOT EXISTS idx_inspection_jobs_technician_id ON inspection_jobs(technician_id);
CREATE INDEX IF NOT EXISTS idx_inspection_job_equipment_job_id ON inspection_job_equipment(job_id);
CREATE INDEX IF NOT EXISTS idx_inspection_job_equipment_equipment_id ON inspection_job_equipment(equipment_id);
CREATE INDEX IF NOT EXISTS idx_inspection_job_equipment_inspection_id ON inspection_job_equipment(inspection_id);

-- Add foreign key constraints
ALTER TABLE equipment_inspections
ADD CONSTRAINT fk_equipment_inspections_job_id FOREIGN KEY (job_id) REFERENCES inspection_jobs(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_equipment_inspections_property_id FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inspection_jobs_updated_at
    BEFORE UPDATE ON inspection_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_job_equipment_updated_at
    BEFORE UPDATE ON inspection_job_equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

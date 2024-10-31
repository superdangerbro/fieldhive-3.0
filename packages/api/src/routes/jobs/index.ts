import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';
import { Setting } from '../../entities/Setting';
import { Job } from '../../entities/Job';

interface JobResponse {
    job_id: string;
    title: string;
    description: string | null;
    property_id: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    created_at: Date;
    updated_at: Date;
    job_type: {
        job_type_id: string;
        name: string;
    };
    property: {
        property_id: string;
        name: string;
        address: string;
        service_address: any;
        billing_address: any;
    };
    accounts: Array<{
        account_id: string;
        name: string;
        addresses: Array<any>;
    }>;
    use_custom_addresses: boolean;
    service_address_id: string | null;
    service_address: any;
    billing_address_id: string | null;
    billing_address: any;
}

const router = Router();

// Valid job statuses
const VALID_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'] as const;
type JobStatus = typeof VALID_STATUSES[number];

const isValidStatus = (status: string): status is JobStatus => {
    return VALID_STATUSES.includes(status as JobStatus);
};

const GET_JOBS_QUERY = `
WITH account_addresses AS (
    SELECT 
        a.account_id,
        jsonb_agg(
            jsonb_build_object(
                'address_id', addr.address_id,
                'address1', addr.address1,
                'address2', addr.address2,
                'city', addr.city,
                'province', addr.province,
                'postal_code', addr.postal_code,
                'country', addr.country
            )
        ) FILTER (WHERE addr.address_id IS NOT NULL) as addresses
    FROM accounts a
    LEFT JOIN addresses addr ON addr.address_id = a.billing_address_id
    GROUP BY a.account_id
)
SELECT 
    j.job_id,
    j.title,
    j.property_id,
    CASE 
        WHEN j.status IN ('pending', 'in_progress', 'completed', 'cancelled') THEN j.status
        ELSE 'pending'
    END as status,
    j.description,
    j.job_type_id,
    j.created_at,
    j.updated_at,
    j.use_custom_addresses,
    j.service_address_id,
    j.billing_address_id,
    jsonb_build_object(
        'property_id', p.property_id,
        'name', COALESCE(p.name, 'N/A'),
        'service_address', CASE 
            WHEN psa.address_id IS NOT NULL THEN jsonb_build_object(
                'address_id', psa.address_id,
                'address1', psa.address1,
                'address2', psa.address2,
                'city', psa.city,
                'province', psa.province,
                'postal_code', psa.postal_code,
                'country', psa.country
            )
            ELSE NULL
        END,
        'billing_address', CASE 
            WHEN pba.address_id IS NOT NULL THEN jsonb_build_object(
                'address_id', pba.address_id,
                'address1', pba.address1,
                'address2', pba.address2,
                'city', pba.city,
                'province', pba.province,
                'postal_code', pba.postal_code,
                'country', pba.country
            )
            ELSE NULL
        END
    ) as property,
    CASE 
        WHEN jsa.address_id IS NOT NULL THEN jsonb_build_object(
            'address_id', jsa.address_id,
            'address1', jsa.address1,
            'address2', jsa.address2,
            'city', jsa.city,
            'province', jsa.province,
            'postal_code', jsa.postal_code,
            'country', jsa.country
        )
        ELSE NULL
    END as service_address,
    CASE 
        WHEN jba.address_id IS NOT NULL THEN jsonb_build_object(
            'address_id', jba.address_id,
            'address1', jba.address1,
            'address2', jba.address2,
            'city', jba.city,
            'province', jba.province,
            'postal_code', jba.postal_code,
            'country', jba.country
        )
        ELSE NULL
    END as billing_address,
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'account_id', a.account_id,
                'name', COALESCE(a.name, 'N/A'),
                'addresses', COALESCE(aa.addresses, '[]'::jsonb)
            )
        )
        FROM properties_accounts pa
        JOIN accounts a ON a.account_id = pa.account_id
        LEFT JOIN account_addresses aa ON aa.account_id = a.account_id
        WHERE pa.property_id = p.property_id
    ) as accounts,
    COALESCE(jt.name, j.job_type_id) as job_type_name
FROM jobs j
LEFT JOIN properties p ON p.property_id = j.property_id
-- Job's custom addresses
LEFT JOIN addresses jsa ON jsa.address_id = j.service_address_id
LEFT JOIN addresses jba ON jba.address_id = j.billing_address_id
-- Property's addresses
LEFT JOIN addresses psa ON psa.address_id = p.service_address_id
LEFT JOIN addresses pba ON pba.address_id = p.billing_address_id
LEFT JOIN (
    SELECT s.value->>'id' as id, s.value->>'name' as name 
    FROM settings s
    CROSS JOIN jsonb_array_elements(s.value::jsonb) 
    WHERE s.key = 'job_types'
) jt ON jt.id = j.job_type_id
WHERE j.job_id IS NOT NULL`;

// Create new job
router.post('/', async (req, res) => {
    try {
        const {
            title,
            description,
            propertyId,
            jobTypeId,
            status = 'pending',
            use_custom_addresses = false,
            custom_service_address,
            custom_billing_address
        } = req.body;

        logger.info('Creating new job:', {
            title,
            description,
            propertyId,
            jobTypeId,
            status,
            use_custom_addresses,
            custom_service_address,
            custom_billing_address
        });

        // Validate required fields
        if (!title || !propertyId || !jobTypeId) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Missing required fields: title, propertyId, or jobTypeId'
            });
        }

        // Validate status
        if (status && !isValidStatus(status)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Invalid status value'
            });
        }

        // Start transaction
        await AppDataSource.query('BEGIN');

        try {
            // Create custom addresses if provided
            let serviceAddressId = null;
            let billingAddressId = null;

            if (use_custom_addresses) {
                if (custom_service_address) {
                    const [newServiceAddress] = await AppDataSource.query(
                        `INSERT INTO addresses (
                            address1, address2, city, province, postal_code, country, created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING address_id`,
                        [
                            custom_service_address.address1,
                            custom_service_address.address2,
                            custom_service_address.city,
                            custom_service_address.province,
                            custom_service_address.postal_code,
                            custom_service_address.country
                        ]
                    );
                    serviceAddressId = newServiceAddress.address_id;
                }

                if (custom_billing_address) {
                    const [newBillingAddress] = await AppDataSource.query(
                        `INSERT INTO addresses (
                            address1, address2, city, province, postal_code, country, created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING address_id`,
                        [
                            custom_billing_address.address1,
                            custom_billing_address.address2,
                            custom_billing_address.city,
                            custom_billing_address.province,
                            custom_billing_address.postal_code,
                            custom_billing_address.country
                        ]
                    );
                    billingAddressId = newBillingAddress.address_id;
                }
            }

            // Create job
            const [newJob] = await AppDataSource.query(
                `INSERT INTO jobs (
                    title,
                    description,
                    property_id,
                    job_type_id,
                    status,
                    use_custom_addresses,
                    service_address_id,
                    billing_address_id,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
                RETURNING job_id`,
                [
                    title,
                    description,
                    propertyId,
                    jobTypeId,
                    status,
                    use_custom_addresses,
                    serviceAddressId,
                    billingAddressId
                ]
            );

            await AppDataSource.query('COMMIT');

            // Fetch complete job data
            const [createdJob] = await AppDataSource.query(
                `${GET_JOBS_QUERY} AND j.job_id = $1`,
                [newJob.job_id]
            );

            const response: JobResponse = {
                ...createdJob,
                job_type: {
                    job_type_id: createdJob.job_type_id,
                    name: createdJob.job_type_name || createdJob.job_type_id
                }
            };

            res.status(201).json(response);
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error creating job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create job',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Get all jobs with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const offset = (page - 1) * pageSize;

        logger.info('Fetching jobs with params:', { page, pageSize, offset });

        // Get the jobs with pagination
        const jobsQuery = `${GET_JOBS_QUERY} ORDER BY j.created_at DESC LIMIT $1 OFFSET $2`;
        
        const [jobs, total] = await Promise.all([
            AppDataSource.query(jobsQuery, [pageSize, offset]),
            AppDataSource.query('SELECT COUNT(*) as count FROM jobs j')
        ]);

        // Format the response to match JobsResponse type
        const response = {
            jobs: jobs.map((job: any) => ({
                ...job,
                // Ensure status is valid
                status: isValidStatus(job.status) ? job.status : 'pending',
                job_type: {
                    job_type_id: job.job_type_id,
                    name: job.job_type_name || job.job_type_id
                }
            })),
            total: parseInt(total[0].count),
            limit: pageSize,
            offset: offset
        };

        res.json(response);
    } catch (error) {
        logger.error('Error fetching jobs:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch jobs',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Update job
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            status, 
            description,
            property_id,
            use_custom_addresses,
            service_address_id,
            billing_address_id,
            custom_service_address,
            custom_billing_address,
            job_type_id
        } = req.body;

        logger.info('Updating job:', { 
            id, 
            title, 
            status, 
            description,
            property_id,
            use_custom_addresses,
            service_address_id,
            billing_address_id,
            custom_service_address,
            custom_billing_address,
            job_type_id
        });

        // Verify job exists
        const [existingJob] = await AppDataSource.query(
            'SELECT job_id FROM jobs WHERE job_id = $1',
            [id]
        );

        if (!existingJob) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Job not found'
            });
        }

        // Validate status
        if (status && !isValidStatus(status)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Invalid status value'
            });
        }

        // Start transaction
        await AppDataSource.query('BEGIN');

        try {
            // Create new addresses if provided
            let finalServiceAddressId = service_address_id;
            let finalBillingAddressId = billing_address_id;

            if (custom_service_address) {
                const [newServiceAddress] = await AppDataSource.query(
                    `INSERT INTO addresses (
                        address1, address2, city, province, postal_code, country, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING address_id`,
                    [
                        custom_service_address.address1,
                        custom_service_address.address2,
                        custom_service_address.city,
                        custom_service_address.province,
                        custom_service_address.postal_code,
                        custom_service_address.country
                    ]
                );
                finalServiceAddressId = newServiceAddress.address_id;
            }

            if (custom_billing_address) {
                const [newBillingAddress] = await AppDataSource.query(
                    `INSERT INTO addresses (
                        address1, address2, city, province, postal_code, country, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING address_id`,
                    [
                        custom_billing_address.address1,
                        custom_billing_address.address2,
                        custom_billing_address.city,
                        custom_billing_address.province,
                        custom_billing_address.postal_code,
                        custom_billing_address.country
                    ]
                );
                finalBillingAddressId = newBillingAddress.address_id;
            }

            // Update job with validated status
            await AppDataSource.query(
                `UPDATE jobs SET 
                    title = COALESCE($1, title),
                    status = COALESCE($2, status),
                    description = COALESCE($3, description),
                    property_id = COALESCE($4, property_id),
                    use_custom_addresses = COALESCE($5, use_custom_addresses),
                    service_address_id = COALESCE($6, service_address_id),
                    billing_address_id = COALESCE($7, billing_address_id),
                    job_type_id = COALESCE($8, job_type_id),
                    updated_at = NOW()
                WHERE job_id = $9`,
                [
                    title,
                    status,
                    description,
                    property_id,
                    use_custom_addresses,
                    finalServiceAddressId,
                    finalBillingAddressId,
                    job_type_id,
                    id
                ]
            );

            await AppDataSource.query('COMMIT');

            // Fetch updated job with relations
            const [updatedJob] = await AppDataSource.query(
                `${GET_JOBS_QUERY} AND j.job_id = $1`,
                [id]
            );

            const response: JobResponse = {
                ...updatedJob,
                job_type: {
                    job_type_id: updatedJob.job_type_id,
                    name: updatedJob.job_type_name || updatedJob.job_type_id
                }
            };

            res.json(response);
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error updating job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update job',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Delete job
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        logger.info('Deleting job:', id);

        const result = await AppDataSource.query(
            'DELETE FROM jobs WHERE job_id = $1 RETURNING job_id',
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Job not found'
            });
        }

        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete job',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

export default router;

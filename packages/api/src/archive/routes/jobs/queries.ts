/**
 * SQL queries for job operations
 * Centralized location for all job-related database queries
 */

export const GET_JOBS_QUERY = `
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

export const CREATE_ADDRESS_QUERY = `
INSERT INTO addresses (
    address1, address2, city, province, postal_code, country, created_at, updated_at
) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
RETURNING address_id`;

export const CREATE_JOB_QUERY = `
INSERT INTO jobs (
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
RETURNING job_id`;

export const UPDATE_JOB_QUERY = `
UPDATE jobs SET 
    title = COALESCE($1, title),
    status = COALESCE($2, status),
    description = COALESCE($3, description),
    property_id = COALESCE($4, property_id),
    use_custom_addresses = COALESCE($5, use_custom_addresses),
    service_address_id = COALESCE($6, service_address_id),
    billing_address_id = COALESCE($7, billing_address_id),
    job_type_id = COALESCE($8, job_type_id),
    updated_at = NOW()
WHERE job_id = $9`;

export const CHECK_JOB_EXISTS_QUERY = `
SELECT job_id FROM jobs WHERE job_id = $1`;

export const DELETE_JOB_QUERY = `
DELETE FROM jobs WHERE job_id = $1 RETURNING job_id`;

export const COUNT_JOBS_QUERY = `
SELECT COUNT(*) as count FROM jobs j`;

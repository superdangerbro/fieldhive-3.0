/**
 * SQL queries for account operations
 * Centralized location for all account-related database queries
 */

export const GET_ACCOUNTS_QUERY = `
SELECT 
    a.account_id,
    a.name,
    a.type,
    a.status,
    a.created_at,
    a.updated_at,
    jsonb_build_object(
        'address_id', ba.address_id,
        'address1', ba.address1,
        'address2', ba.address2,
        'city', ba.city,
        'province', ba.province,
        'postal_code', ba.postal_code,
        'country', ba.country
    ) as billing_address,
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'property_id', p.property_id,
                'name', p.name,
                'role', pa.role
            )
        )
        FROM properties_accounts pa
        JOIN properties p ON p.property_id = pa.property_id
        WHERE pa.account_id = a.account_id
    ) as properties
FROM accounts a
LEFT JOIN addresses ba ON ba.address_id = a.billing_address_id
WHERE a.account_id IS NOT NULL`;

export const CREATE_ACCOUNT_QUERY = `
INSERT INTO accounts (
    name,
    type,
    status,
    billing_address_id,
    created_at,
    updated_at
) VALUES ($1, $2, $3, $4, NOW(), NOW())
RETURNING account_id`;

export const UPDATE_ACCOUNT_QUERY = `
UPDATE accounts SET 
    name = COALESCE($1, name),
    type = COALESCE($2, type),
    status = COALESCE($3, status),
    billing_address_id = COALESCE($4, billing_address_id),
    updated_at = NOW()
WHERE account_id = $5`;

export const CHECK_ACCOUNT_EXISTS_QUERY = `
SELECT account_id FROM accounts WHERE account_id = $1`;

export const DELETE_ACCOUNT_QUERY = `
DELETE FROM accounts WHERE account_id = $1 RETURNING account_id`;

export const COUNT_ACCOUNTS_QUERY = `
SELECT COUNT(*) as count FROM accounts`;

export const CREATE_ADDRESS_QUERY = `
INSERT INTO addresses (
    address1,
    address2,
    city,
    province,
    postal_code,
    country,
    created_at,
    updated_at
) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
RETURNING address_id`;

export const GET_ACCOUNT_PROPERTIES_QUERY = `
SELECT 
    p.property_id,
    p.name,
    pa.role
FROM properties_accounts pa
JOIN properties p ON p.property_id = pa.property_id
WHERE pa.account_id = $1`;

export const LINK_ACCOUNT_PROPERTY_QUERY = `
INSERT INTO properties_accounts (
    account_id,
    property_id,
    role
) VALUES ($1, $2, $3)
ON CONFLICT (account_id, property_id) 
DO UPDATE SET role = EXCLUDED.role`;

export const UNLINK_ACCOUNT_PROPERTY_QUERY = `
DELETE FROM properties_accounts 
WHERE account_id = $1 AND property_id = $2`;

/**
 * Example Usage:
 * ```typescript
 * // Get accounts with pagination
 * const accounts = await AppDataSource.query(
 *   `${GET_ACCOUNTS_QUERY} ORDER BY a.created_at DESC LIMIT $1 OFFSET $2`,
 *   [limit, offset]
 * );
 * 
 * // Create new account
 * const [newAccount] = await AppDataSource.query(
 *   CREATE_ACCOUNT_QUERY,
 *   [name, type, 'Active', billingAddressId]
 * );
 * ```
 */

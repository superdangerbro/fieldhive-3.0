import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';

interface QueryParams {
    limit?: string;
    offset?: string;
    search?: string;
    minimal?: string;
}

export async function listAccounts(req: Request<Record<string, never>, unknown, unknown, QueryParams>, res: Response) {
    try {
        const limit = parseInt(req.query.limit || '10');
        const offset = parseInt(req.query.offset || '0');
        const search = req.query.search;
        const minimal = req.query.minimal === 'true';

        console.info(`Fetching accounts with limit ${limit} offset ${offset} search ${search} minimal ${minimal}`);

        // Use a simpler query for minimal requests (just id and name)
        if (minimal) {
            const query = `
                SELECT 
                    account_id,
                    name
                FROM accounts
                WHERE status != 'archived'
                ${search ? 'AND name ILIKE $3' : ''}
                ORDER BY name ASC
                LIMIT $1 OFFSET $2
            `;

            const countQuery = `
                SELECT COUNT(*) AS total 
                FROM accounts
                WHERE status != 'archived'
                ${search ? 'AND name ILIKE $1' : ''}
            `;

            const params = search 
                ? [limit, offset, `%${search}%`]
                : [limit, offset];

            const countParams = search ? [`%${search}%`] : [];

            const [result, countResult] = await Promise.all([
                AppDataSource.query(query, params),
                AppDataSource.query(countQuery, countParams)
            ]);

            return res.json({
                accounts: result,
                total: parseInt(countResult[0].total),
                limit,
                offset
            });
        }

        // Full account details query for the accounts page
        const query = `
            WITH account_data AS (
                SELECT
                    a.account_id,
                    a.name,
                    a.type,
                    a.status,
                    a.created_at,
                    a.updated_at,
                    CASE 
                        WHEN addr.address_id IS NOT NULL THEN
                            jsonb_build_object(
                                'address_id', addr.address_id,
                                'address1', addr.address1,
                                'address2', addr.address2,
                                'city', addr.city,
                                'province', addr.province,
                                'postal_code', addr.postal_code,
                                'country', addr.country
                            )
                        ELSE NULL
                    END AS billing_address,
                    COALESCE(
                        jsonb_agg(
                            DISTINCT jsonb_build_object(
                                'property_id', p.property_id,
                                'name', p.name,
                                'type', p.property_type,
                                'status', p.status,
                                'service_address', (
                                    SELECT jsonb_build_object(
                                        'address_id', sa.address_id,
                                        'address1', sa.address1,
                                        'address2', sa.address2,
                                        'city', sa.city,
                                        'province', sa.province,
                                        'postal_code', sa.postal_code,
                                        'country', sa.country
                                    )
                                    FROM addresses sa
                                    WHERE sa.address_id = p.service_address_id
                                )
                            )
                        ) FILTER (WHERE p.property_id IS NOT NULL),
                        '[]'::jsonb
                    ) AS properties
                FROM accounts a
                LEFT JOIN addresses addr ON addr.address_id = a.billing_address_id
                LEFT JOIN properties_accounts pa ON pa.account_id = a.account_id
                LEFT JOIN properties p ON p.property_id = pa.property_id
                WHERE ${search ? 'a.account_id::text = $3 OR a.name ILIKE $4' : '1=1'}
                GROUP BY
                    a.account_id,
                    addr.address_id,
                    addr.address1,
                    addr.address2,
                    addr.city,
                    addr.province,
                    addr.postal_code,
                    addr.country
            )
            SELECT * FROM account_data
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const countQuery = `
            SELECT COUNT(DISTINCT account_id) AS total 
            FROM accounts
            WHERE ${search ? 'account_id::text = $1 OR name ILIKE $2' : '1=1'}
        `;

        const params = search 
            ? [limit, offset, search, `%${search}%`]
            : [limit, offset];

        const countParams = search ? [search, `%${search}%`] : [];

        const [result, countResult] = await Promise.all([
            AppDataSource.query(query, params),
            AppDataSource.query(countQuery, countParams)
        ]);

        return res.json({
            accounts: result,
            total: parseInt(countResult[0].total)
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

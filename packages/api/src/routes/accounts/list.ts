import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';

interface QueryParams {
  page?: string;
  pageSize?: string;
  search?: string;
}

export async function listAccounts(req: Request<Record<string, never>, unknown, unknown, QueryParams>, res: Response) {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '10');
    const search = req.query.search;
    const offset = (page - 1) * pageSize;

    console.info(`Fetching accounts with page ${page} pageSize ${pageSize} offset ${offset} search ${search}`);

    const query = `
      SELECT
        a.account_id AS id,
        a.name,
        a.is_company AS "isCompany",
        a.status,
        a.created_at AS "createdAt",
        a.updated_at AS "updatedAt",
        json_build_object(
          'address1', aba.address1,
          'address2', aba.address2,
          'city', aba.city,
          'province', aba.province,
          'postalCode', aba."postalCode",
          'country', aba.country
        ) AS "billingAddress",
        COALESCE(
          json_agg(
            json_build_object(
              'propertyId', p.property_id,
              'name', p.name,
              'address1', p.address1,
              'address2', p.address2,
              'role', paj.role,
              'billingAddress', CASE
                WHEN pba.use_account_billing THEN json_build_object(
                  'useAccountBilling', true
                )
                ELSE json_build_object(
                  'useAccountBilling', false,
                  'address', json_build_object(
                    'address1', pba.address1,
                    'address2', pba.address2,
                    'city', pba.city,
                    'province', pba.province,
                    'postalCode', pba."postalCode",
                    'country', pba.country
                  )
                )
              END
            )
          ) FILTER (WHERE p.property_id IS NOT NULL),
          '[]'::json
        ) AS properties
      FROM accounts a
      LEFT JOIN account_billing_address aba ON aba.account_id = a.account_id
      LEFT JOIN properties_accounts_join paj ON paj.account_id = a.account_id
      LEFT JOIN properties p ON p.property_id = paj.property_id
      LEFT JOIN property_billing_address pba ON pba.property_id = p.property_id
      ${search ? 'WHERE a.name ILIKE $3' : ''}
      GROUP BY
        a.account_id,
        aba.address1,
        aba.address2,
        aba.city,
        aba.province,
        aba."postalCode",
        aba.country
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM accounts a
      ${search ? 'WHERE a.name ILIKE $1' : ''}
    `;

    const params = search 
      ? [pageSize, offset, `%${search}%`]
      : [pageSize, offset];

    const countParams = search ? [`%${search}%`] : [];

    console.log('Executing query:', query.replace(/\s+/g, ' ').trim());
    console.log('With params:', params);

    const [result, countResult] = await Promise.all([
      AppDataSource.query(query, params),
      AppDataSource.query(countQuery, countParams)
    ]);

    return res.json({
      accounts: result,
      total: parseInt(countResult[0].total),
      page,
      pageSize
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

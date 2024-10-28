import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

export const getAccounts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const offset = (page - 1) * pageSize;

        logger.info(`Fetching accounts with page ${page}, pageSize ${pageSize}, offset ${offset}`);

        const [accounts, total] = await Promise.all([
            AppDataSource.query(
                `SELECT 
                    a.account_id as id,
                    a.name,
                    a.is_company as "isCompany",
                    a.status,
                    a.created_at as "createdAt",
                    a.updated_at as "updatedAt",
                    json_build_object(
                        'address1', aba.address1,
                        'address2', aba.address2,
                        'city', aba.city,
                        'province', aba.province,
                        'postalCode', aba."postalCode",
                        'country', aba.country
                    ) as "billingAddress",
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'propertyId', p.property_id,
                                'name', p.name,
                                'address1', p.address1,  -- Updated to address1
                                'address2', p.address2,  -- Updated to address2
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
                    ) as properties
                FROM accounts a
                LEFT JOIN account_billing_address aba ON aba.account_id = a.account_id
                LEFT JOIN properties_accounts_join paj ON paj.account_id = a.account_id
                LEFT JOIN properties p ON p.property_id = paj.property_id
                LEFT JOIN property_billing_address pba ON pba.property_id = p.property_id
                GROUP BY 
                    a.account_id,
                    aba.address1,
                    aba.address2,
                    aba.city,
                    aba.province,
                    aba."postalCode",
                    aba.country
                ORDER BY a.created_at DESC
                LIMIT $1 OFFSET $2`,
                [pageSize, offset]
            ),
            AppDataSource.query('SELECT COUNT(*) as total FROM accounts')
        ]);

        // Format response
        const formattedAccounts = accounts.map((account: any) => ({
            ...account,
            properties: account.properties || []
        }));

        res.json({
            accounts: formattedAccounts,
            total: parseInt(total[0].total),
            page,
            pageSize
        });
    } catch (error) {
        logger.error('Error fetching accounts:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch accounts'
        });
    }
};

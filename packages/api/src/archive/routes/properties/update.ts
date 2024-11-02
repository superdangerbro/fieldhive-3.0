import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';
import { UpdatePropertyDto } from '@fieldhive/shared';

export const updateProperty = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { 
        name,
        billing_address,
        service_address,
        accounts
    } = req.body as UpdatePropertyDto;

    try {
        await AppDataSource.transaction(async (transactionalEntityManager) => {
            // Update or create service address if provided
            let service_address_id = null;
            if (service_address) {
                const [existingServiceAddress] = await transactionalEntityManager.query(
                    `SELECT service_address_id FROM properties WHERE property_id = $1`,
                    [id]
                );

                if (existingServiceAddress?.service_address_id) {
                    await transactionalEntityManager.query(
                        `UPDATE addresses 
                        SET address1 = $1, address2 = $2, city = $3, province = $4, postal_code = $5, country = $6
                        WHERE address_id = $7`,
                        [
                            service_address.address1,
                            service_address.address2 || null,
                            service_address.city,
                            service_address.province,
                            service_address.postal_code,
                            service_address.country || 'Canada',
                            existingServiceAddress.service_address_id
                        ]
                    );
                    service_address_id = existingServiceAddress.service_address_id;
                } else {
                    const [newAddress] = await transactionalEntityManager.query(
                        `INSERT INTO addresses (address1, address2, city, province, postal_code, country)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING address_id`,
                        [
                            service_address.address1,
                            service_address.address2 || null,
                            service_address.city,
                            service_address.province,
                            service_address.postal_code,
                            service_address.country || 'Canada'
                        ]
                    );
                    service_address_id = newAddress.address_id;
                }
            }

            // Update or create billing address if provided
            let billing_address_id = null;
            if (billing_address) {
                const [existingBillingAddress] = await transactionalEntityManager.query(
                    `SELECT billing_address_id FROM properties WHERE property_id = $1`,
                    [id]
                );

                if (existingBillingAddress?.billing_address_id) {
                    await transactionalEntityManager.query(
                        `UPDATE addresses 
                        SET address1 = $1, address2 = $2, city = $3, province = $4, postal_code = $5, country = $6
                        WHERE address_id = $7`,
                        [
                            billing_address.address1,
                            billing_address.address2 || null,
                            billing_address.city,
                            billing_address.province,
                            billing_address.postal_code,
                            billing_address.country || 'Canada',
                            existingBillingAddress.billing_address_id
                        ]
                    );
                    billing_address_id = existingBillingAddress.billing_address_id;
                } else {
                    const [newAddress] = await transactionalEntityManager.query(
                        `INSERT INTO addresses (address1, address2, city, province, postal_code, country)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING address_id`,
                        [
                            billing_address.address1,
                            billing_address.address2 || null,
                            billing_address.city,
                            billing_address.province,
                            billing_address.postal_code,
                            billing_address.country || 'Canada'
                        ]
                    );
                    billing_address_id = newAddress.address_id;
                }
            }

            // Build the update query for property fields
            const updates = [];
            const params = [];
            let paramCount = 1;

            if (name !== undefined) {
                updates.push(`name = $${paramCount}`);
                params.push(name);
                paramCount++;
            }

            if (service_address_id !== null) {
                updates.push(`service_address_id = $${paramCount}`);
                params.push(service_address_id);
                paramCount++;
            }

            if (billing_address_id !== null) {
                updates.push(`billing_address_id = $${paramCount}`);
                params.push(billing_address_id);
                paramCount++;
            }

            updates.push(`updated_at = NOW()`);

            // Update property if there are fields to update
            if (updates.length > 0) {
                const updateQuery = `
                    UPDATE properties 
                    SET ${updates.join(', ')}
                    WHERE property_id = $${paramCount}
                `;
                logger.info('Executing update query:', {
                    query: updateQuery,
                    params: [...params, id]
                });
                
                await transactionalEntityManager.query(updateQuery, [...params, id]);
            }

            // Update accounts if provided
            if (accounts) {
                // First, remove all existing account associations
                await transactionalEntityManager.query(
                    `DELETE FROM properties_accounts WHERE property_id = $1`,
                    [id]
                );

                // Then, add new account associations
                if (accounts.length > 0) {
                    const values = accounts.map((_, index) => 
                        `($1, $${index + 2})`
                    ).join(', ');

                    await transactionalEntityManager.query(
                        `INSERT INTO properties_accounts (property_id, account_id) VALUES ${values}`,
                        [id, ...accounts.map(a => a.account_id)]
                    );
                }
            }

            // Get updated property with addresses and accounts
            const [updatedProperty] = await transactionalEntityManager.query(
                `SELECT 
                    p.*,
                    ba.address_id as billing_address_id,
                    ba.address1 as billing_address1,
                    ba.address2 as billing_address2,
                    ba.city as billing_city,
                    ba.province as billing_province,
                    ba.postal_code as billing_postal_code,
                    ba.country as billing_country,
                    sa.address_id as service_address_id,
                    sa.address1 as service_address1,
                    sa.address2 as service_address2,
                    sa.city as service_city,
                    sa.province as service_province,
                    sa.postal_code as service_postal_code,
                    sa.country as service_country,
                    COALESCE(
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'account_id', a.account_id,
                                    'name', a.name
                                )
                            )
                            FROM properties_accounts pa
                            JOIN accounts a ON a.account_id = pa.account_id
                            WHERE pa.property_id = p.property_id
                        ),
                        '[]'::json
                    ) as accounts
                FROM properties p
                LEFT JOIN addresses ba ON ba.address_id = p.billing_address_id
                LEFT JOIN addresses sa ON sa.address_id = p.service_address_id
                WHERE p.property_id = $1`,
                [id]
            );

            // Format the response to match the Property type
            const response = {
                ...updatedProperty,
                billing_address: updatedProperty.billing_address_id ? {
                    address_id: updatedProperty.billing_address_id,
                    address1: updatedProperty.billing_address1,
                    address2: updatedProperty.billing_address2,
                    city: updatedProperty.billing_city,
                    province: updatedProperty.billing_province,
                    postal_code: updatedProperty.billing_postal_code,
                    country: updatedProperty.billing_country
                } : null,
                service_address: updatedProperty.service_address_id ? {
                    address_id: updatedProperty.service_address_id,
                    address1: updatedProperty.service_address1,
                    address2: updatedProperty.service_address2,
                    city: updatedProperty.service_city,
                    province: updatedProperty.service_province,
                    postal_code: updatedProperty.service_postal_code,
                    country: updatedProperty.service_country
                } : null
            };

            // Clean up the response by removing the flattened address fields
            delete response.billing_address_id;
            delete response.billing_address1;
            delete response.billing_address2;
            delete response.billing_city;
            delete response.billing_province;
            delete response.billing_postal_code;
            delete response.billing_country;
            delete response.service_address_id;
            delete response.service_address1;
            delete response.service_address2;
            delete response.service_city;
            delete response.service_province;
            delete response.service_postal_code;
            delete response.service_country;

            res.json(response);
        });
    } catch (error) {
        logger.error('Error updating property:', {
            propertyId: id,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error,
            requestBody: req.body
        });

        // Send a more detailed error message to the client
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Failed to update property',
            details: error instanceof Error ? error.stack : String(error)
        });
    }
};

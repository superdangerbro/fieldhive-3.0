import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';

interface UpdatePropertyAddressDto {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
}

export async function updatePropertyAddress(req: Request, res: Response) {
    const { accountId, propertyId } = req.params;
    const { address } = req.body as { address: UpdatePropertyAddressDto };

    try {
        await AppDataSource.transaction(async (transactionalEntityManager) => {
            // Verify property belongs to account
            const [property] = await transactionalEntityManager.query(
                `SELECT p.* FROM properties p
                JOIN properties_accounts pa ON pa.property_id = p.property_id
                WHERE p.property_id = $1 AND pa.account_id = $2`,
                [propertyId, accountId]
            );

            if (!property) {
                return res.status(404).json({ error: 'Property not found or not associated with this account' });
            }

            // Update or create service address
            if (address) {
                const existingAddress = await transactionalEntityManager.query(
                    `SELECT address_id FROM addresses WHERE address_id = (
                        SELECT service_address_id FROM properties WHERE property_id = $1
                    )`,
                    [propertyId]
                );

                if (existingAddress.length > 0) {
                    await transactionalEntityManager.query(
                        `UPDATE addresses 
                        SET address1 = $1, address2 = $2, city = $3, province = $4, 
                            postal_code = $5, country = $6, updated_at = CURRENT_TIMESTAMP
                        WHERE address_id = $7`,
                        [
                            address.address1,
                            address.address2,
                            address.city,
                            address.province,
                            address.postal_code,
                            address.country,
                            existingAddress[0].address_id
                        ]
                    );
                } else {
                    const [newAddress] = await transactionalEntityManager.query(
                        `INSERT INTO addresses (
                            address1, address2, city, province, postal_code, country
                        ) VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING address_id`,
                        [
                            address.address1,
                            address.address2,
                            address.city,
                            address.province,
                            address.postal_code,
                            address.country
                        ]
                    );

                    await transactionalEntityManager.query(
                        `UPDATE properties 
                        SET service_address_id = $1
                        WHERE property_id = $2`,
                        [newAddress.address_id, propertyId]
                    );
                }
            }
        });

        // Get updated property with address
        const [updatedProperty] = await AppDataSource.query(
            `SELECT 
                p.*,
                addr.address_id,
                addr.address1,
                addr.address2,
                addr.city,
                addr.province,
                addr.postal_code,
                addr.country
            FROM properties p
            LEFT JOIN addresses addr ON addr.address_id = p.service_address_id
            WHERE p.property_id = $1`,
            [propertyId]
        );

        res.json(updatedProperty);
    } catch (error) {
        console.error('Error updating property address:', error);
        res.status(500).json({ error: 'Failed to update property address' });
    }
}

import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { UpdateAccountDto } from '@fieldhive/shared';

export async function updateAccount(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body as UpdateAccountDto;

    try {
        await AppDataSource.transaction(async (transactionalEntityManager) => {
            // Build update query dynamically based on provided fields
            const updateFields = [];
            const values = [];
            let paramCount = 1;

            if (updates.name !== undefined) {
                updateFields.push(`name = $${paramCount}`);
                values.push(updates.name);
                paramCount++;
            }
            if (updates.type !== undefined) {
                updateFields.push(`type = $${paramCount}`);
                values.push(updates.type);
                paramCount++;
            }
            if (updates.status !== undefined) {
                updateFields.push(`status = $${paramCount}`);
                values.push(updates.status);
                paramCount++;
            }

            // Add updated_at timestamp
            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

            // Add account_id as the last parameter
            values.push(id);

            if (updateFields.length > 0) {
                await transactionalEntityManager.query(
                    `UPDATE accounts 
                    SET ${updateFields.join(', ')}
                    WHERE account_id = $${paramCount}`,
                    values
                );
            }

            // Update or create billing address
            if (updates.address) {
                const existingAddress = await transactionalEntityManager.query(
                    `SELECT address_id FROM addresses WHERE address_id = (
                        SELECT billing_address_id FROM accounts WHERE account_id = $1
                    )`,
                    [id]
                );

                if (existingAddress.length > 0) {
                    await transactionalEntityManager.query(
                        `UPDATE addresses 
                        SET address1 = $1, address2 = $2, city = $3, province = $4, 
                            postal_code = $5, country = $6, updated_at = CURRENT_TIMESTAMP
                        WHERE address_id = $7`,
                        [
                            updates.address.address1,
                            updates.address.address2,
                            updates.address.city,
                            updates.address.province,
                            updates.address.postal_code,
                            updates.address.country,
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
                            updates.address.address1,
                            updates.address.address2,
                            updates.address.city,
                            updates.address.province,
                            updates.address.postal_code,
                            updates.address.country
                        ]
                    );

                    await transactionalEntityManager.query(
                        `UPDATE accounts 
                        SET billing_address_id = $1
                        WHERE account_id = $2`,
                        [newAddress.address_id, id]
                    );
                }
            }
        });

        // Get updated account with address
        const [account] = await AppDataSource.query(
            `SELECT 
                a.*,
                addr.address_id,
                addr.address1,
                addr.address2,
                addr.city,
                addr.province,
                addr.postal_code,
                addr.country
            FROM accounts a
            LEFT JOIN addresses addr ON addr.address_id = a.billing_address_id
            WHERE a.account_id = $1`,
            [id]
        );

        res.json(account);
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ error: 'Failed to update account' });
    }
}

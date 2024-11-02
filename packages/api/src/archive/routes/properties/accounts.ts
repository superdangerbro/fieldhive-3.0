import { Request, Response } from 'express';
import db from '../../config/database';

export const getPropertyAccounts = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            `SELECT a.account_id, a.name
             FROM accounts a
             INNER JOIN properties_accounts pa ON pa.account_id = a.account_id
             WHERE pa.property_id = $1`,
            [id]
        );

        // Ensure we're sending a valid JSON array
        const accounts = result.rows || [];
        res.json(accounts);
    } catch (error) {
        console.error('Failed to fetch property accounts:', error);
        res.status(500).json({
            message: 'Failed to fetch property accounts',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

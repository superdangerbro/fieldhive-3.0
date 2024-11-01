import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { AccountResponse, AccountsResponse } from '../types';
import { GET_ACCOUNTS_QUERY, COUNT_ACCOUNTS_QUERY } from '../queries';

/**
 * Get all accounts with pagination
 * Handles:
 * - Pagination
 * - Response formatting
 * - Optional filtering (can be extended)
 */
export const listAccounts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const offset = (page - 1) * pageSize;

        logger.info('Fetching accounts with params:', { page, pageSize, offset });

        // Get accounts with pagination
        const accountsQuery = `${GET_ACCOUNTS_QUERY} ORDER BY a.created_at DESC LIMIT $1 OFFSET $2`;
        
        const [accounts, total] = await Promise.all([
            AppDataSource.query(accountsQuery, [pageSize, offset]),
            AppDataSource.query(COUNT_ACCOUNTS_QUERY)
        ]);

        // Format the response
        const response: AccountsResponse = {
            accounts: accounts.map((account: any) => ({
                ...account,
                properties: account.properties || []
            })),
            total: parseInt(total[0].count),
            limit: pageSize,
            offset: offset
        };

        logger.info('Successfully fetched accounts:', {
            total: response.total,
            pageSize,
            page
        });

        res.json(response);
    } catch (error) {
        logger.error('Error fetching accounts:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch accounts',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

/**
 * Get a single account by ID
 * Handles:
 * - Account retrieval
 * - Response formatting
 * - Not found cases
 */
export const getAccountById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        logger.info('Fetching account by ID:', id);

        const [account] = await AppDataSource.query(
            `${GET_ACCOUNTS_QUERY} AND a.account_id = $1`,
            [id]
        );

        if (!account) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Account not found'
            });
        }

        const response: AccountResponse = {
            ...account,
            properties: account.properties || []
        };

        logger.info('Successfully fetched account:', id);
        res.json(response);
    } catch (error) {
        logger.error('Error fetching account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

/**
 * Example Usage:
 * ```typescript
 * // List accounts with pagination
 * GET /accounts?page=1&pageSize=10
 * 
 * // Get single account
 * GET /accounts/123
 * ```
 */

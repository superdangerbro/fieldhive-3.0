import { Request, Response, NextFunction } from 'express';
import { accountService } from '../../services/accountService';

export async function listAccounts(req: Request, res: Response, next: NextFunction) {
    try {
        const { limit, offset, ...filters } = req.query;
        const result = await accountService.findByFilters({
            ...filters,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
}

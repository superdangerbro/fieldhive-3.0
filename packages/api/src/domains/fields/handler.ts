import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Field } from './entities/Field';
import { logger } from '../../utils/logger';

const fieldRepository = AppDataSource.getRepository(Field);

// Get all fields
export async function getFields(req: Request, res: Response) {
    try {
        const { active } = req.query;
        const queryBuilder = fieldRepository.createQueryBuilder('field');

        if (active !== undefined) {
            queryBuilder.andWhere('field.isActive = :active', { active: active === 'true' });
        }

        const [fields, total] = await queryBuilder.getManyAndCount();
        return res.json({ fields, total });
    } catch (error) {
        logger.error('Error getting fields:', error);
        return res.status(500).json({ 
            message: 'Failed to get fields',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Get field by ID
export async function getField(req: Request, res: Response) {
    try {
        const field = await fieldRepository.findOne({
            where: { id: req.params.id }
        });

        if (!field) {
            return res.status(404).json({ message: 'Field not found' });
        }

        return res.json(field);
    } catch (error) {
        logger.error('Error getting field:', error);
        return res.status(500).json({ 
            message: 'Failed to get field',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Create new field
export async function createField(req: Request, res: Response) {
    try {
        // Validate required fields
        const { name } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Field name is required'
            });
        }

        const field = fieldRepository.create(req.body);
        const savedField = await fieldRepository.save(field);
        logger.info('Field created:', savedField);

        return res.status(201).json(savedField);
    } catch (error) {
        logger.error('Error creating field:', error);
        return res.status(500).json({ 
            message: 'Failed to create field',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Update field
export async function updateField(req: Request, res: Response) {
    try {
        const field = await fieldRepository.findOne({
            where: { id: req.params.id }
        });

        if (!field) {
            return res.status(404).json({ message: 'Field not found' });
        }

        // Validate name if being updated
        const { name } = req.body;
        if (name !== undefined && !name.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Field name cannot be empty'
            });
        }

        fieldRepository.merge(field, req.body);
        const updatedField = await fieldRepository.save(field);
        logger.info('Field updated:', updatedField);

        return res.json(updatedField);
    } catch (error) {
        logger.error('Error updating field:', error);
        return res.status(500).json({ 
            message: 'Failed to update field',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Archive field
export async function archiveField(req: Request, res: Response) {
    try {
        const field = await fieldRepository.findOne({
            where: { id: req.params.id }
        });

        if (!field) {
            return res.status(404).json({ message: 'Field not found' });
        }

        field.isActive = false;
        const archivedField = await fieldRepository.save(field);
        logger.info('Field archived:', archivedField);

        return res.json({ success: true });
    } catch (error) {
        logger.error('Error archiving field:', error);
        return res.status(500).json({ 
            message: 'Failed to archive field',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

import { Router } from 'express';
import { listProperties } from './list';
import createProperty from './create';
import updateProperty from './update';
import db from '../../config/database';

const router = Router();

router.get('/', listProperties);
router.post('/', createProperty);
router.put('/:id', updateProperty);

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Check for existing jobs
        const result = await db.query(
            'SELECT COUNT(*) FROM jobs WHERE property_id = $1',
            [id]
        );

        if (parseInt(result.rows[0].count) > 0) {
            return res.status(400).json({
                message: 'Cannot delete property with existing jobs'
            });
        }

        // Delete property
        const deleteResult = await db.query(
            'DELETE FROM properties WHERE id = $1',
            [id]
        );

        if (deleteResult.rowCount === 0) {
            return res.status(404).json({
                message: 'Property not found'
            });
        }

        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Failed to delete property:', error);
        res.status(500).json({
            message: 'Failed to delete property',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;

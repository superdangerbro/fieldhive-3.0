import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { UpdateJobDto, JobResponse } from '../types';
import { 
    CREATE_ADDRESS_QUERY, 
    UPDATE_JOB_QUERY, 
    GET_JOBS_QUERY,
    CHECK_JOB_EXISTS_QUERY 
} from '../queries';

/**
 * Update an existing job
 * Handles:
 * - Job existence verification
 * - Custom address updates
 * - Transaction management
 * - Response formatting
 */
export const updateJob = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            status, 
            description,
            property_id,
            use_custom_addresses,
            service_address_id,
            billing_address_id,
            custom_service_address,
            custom_billing_address,
            job_type_id
        } = req.body as UpdateJobDto;

        logger.info('Updating job:', { 
            id, 
            title, 
            status, 
            description,
            property_id,
            use_custom_addresses,
            service_address_id,
            billing_address_id,
            job_type_id
        });

        // Verify job exists
        const [existingJob] = await AppDataSource.query(
            CHECK_JOB_EXISTS_QUERY,
            [id]
        );

        if (!existingJob) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Job not found'
            });
        }

        // Start transaction
        await AppDataSource.query('BEGIN');

        try {
            // Create new addresses if provided
            let finalServiceAddressId = service_address_id;
            let finalBillingAddressId = billing_address_id;

            if (custom_service_address) {
                const [newServiceAddress] = await AppDataSource.query(
                    CREATE_ADDRESS_QUERY,
                    [
                        custom_service_address.address1,
                        custom_service_address.address2,
                        custom_service_address.city,
                        custom_service_address.province,
                        custom_service_address.postal_code,
                        custom_service_address.country
                    ]
                );
                finalServiceAddressId = newServiceAddress.address_id;
            }

            if (custom_billing_address) {
                const [newBillingAddress] = await AppDataSource.query(
                    CREATE_ADDRESS_QUERY,
                    [
                        custom_billing_address.address1,
                        custom_billing_address.address2,
                        custom_billing_address.city,
                        custom_billing_address.province,
                        custom_billing_address.postal_code,
                        custom_billing_address.country
                    ]
                );
                finalBillingAddressId = newBillingAddress.address_id;
            }

            // Update job
            await AppDataSource.query(
                UPDATE_JOB_QUERY,
                [
                    title,
                    status,
                    description,
                    property_id,
                    use_custom_addresses,
                    finalServiceAddressId,
                    finalBillingAddressId,
                    job_type_id,
                    id
                ]
            );

            await AppDataSource.query('COMMIT');

            // Fetch updated job with relations
            const [updatedJob] = await AppDataSource.query(
                `${GET_JOBS_QUERY} AND j.job_id = $1`,
                [id]
            );

            const response: JobResponse = {
                ...updatedJob,
                job_type: {
                    job_type_id: updatedJob.job_type_id,
                    name: updatedJob.job_type_name || updatedJob.job_type_id
                }
            };

            logger.info('Successfully updated job:', id);
            res.json(response);
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error updating job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update job',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

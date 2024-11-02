import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { CreateJobDto, JobResponse } from '../types';
import { CREATE_ADDRESS_QUERY, CREATE_JOB_QUERY, GET_JOBS_QUERY } from '../queries';

/**
 * Create a new job
 * Handles:
 * - Custom address creation
 * - Job creation
 * - Transaction management
 * - Response formatting
 */
export const createJob = async (req: Request, res: Response) => {
    try {
        const {
            title,
            description,
            propertyId,
            jobTypeId,
            status = 'pending',
            use_custom_addresses = false,
            custom_service_address,
            custom_billing_address
        } = req.body as CreateJobDto;

        logger.info('Creating new job:', {
            title,
            description,
            propertyId,
            jobTypeId,
            status,
            use_custom_addresses
        });

        // Start transaction
        await AppDataSource.query('BEGIN');

        try {
            // Create custom addresses if provided
            let serviceAddressId = null;
            let billingAddressId = null;

            if (use_custom_addresses) {
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
                    serviceAddressId = newServiceAddress.address_id;
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
                    billingAddressId = newBillingAddress.address_id;
                }
            }

            // Create job
            const [newJob] = await AppDataSource.query(
                CREATE_JOB_QUERY,
                [
                    title,
                    description,
                    propertyId,
                    jobTypeId,
                    status,
                    use_custom_addresses,
                    serviceAddressId,
                    billingAddressId
                ]
            );

            await AppDataSource.query('COMMIT');

            // Fetch complete job data
            const [createdJob] = await AppDataSource.query(
                `${GET_JOBS_QUERY} AND j.job_id = $1`,
                [newJob.job_id]
            );

            const response: JobResponse = {
                ...createdJob,
                job_type: {
                    job_type_id: createdJob.job_type_id,
                    name: createdJob.job_type_name || createdJob.job_type_id
                }
            };

            res.status(201).json(response);
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error creating job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create job',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

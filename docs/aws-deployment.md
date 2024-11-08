# AWS Deployment Guide

## Prerequisites
- AWS Account with appropriate IAM permissions
- AWS CLI configured locally
- Node.js and npm/yarn installed

## Infrastructure Setup

1. Create AWS Resources:
   ```bash
   # Create RDS Database
   aws rds create-db-instance \
     --db-instance-identifier field-hive-prod \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username admin \
     --master-user-password <generated-password> \
     --allocated-storage 20

   # Create Secrets in AWS Secrets Manager
   aws secretsmanager create-secret \
     --name field-hive/production/secrets \
     --secret-string '{
       "database": {
         "host": "your-rds-endpoint",
         "port": 5432,
         "name": "field_hive_production",
         "user": "admin",
         "password": "your-db-password"
       },
       "jwt": {
         "secret": "your-jwt-secret"
       }
     }'
   ```

2. Set up Elastic Beanstalk environment:
   ```bash
   eb init field-hive --platform node.js --region us-east-1
   eb create production
   ```

## Security Best Practices

1. Database:
   - Use AWS RDS with encryption at rest
   - Enable automated backups
   - Use SSL for database connections
   - Implement proper IAM roles and security groups

2. Secrets:
   - Never commit secrets to git
   - Use AWS Secrets Manager for all sensitive data
   - Rotate credentials regularly
   - Use least privilege principle for IAM roles

3. Network:
   - Use VPC with private subnets for RDS
   - Enable WAF for API endpoints
   - Implement proper CORS policies
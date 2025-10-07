-- Create databases for different environments
-- This script is run when PostgreSQL container starts

-- Create test database for unit/integration tests
CREATE DATABASE asset_tag_test;

-- Create beta database for beta mode with persistent data
CREATE DATABASE asset_tag_beta;

-- Grant permissions to dev_user for all databases
GRANT ALL PRIVILEGES ON DATABASE asset_tag_test TO dev_user;
GRANT ALL PRIVILEGES ON DATABASE asset_tag_beta TO dev_user;

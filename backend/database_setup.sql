-- MovieHub Database Setup SQL Script
-- Run this with: psql postgres -f database_setup.sql

-- Create user
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'moviehub_user') THEN
      CREATE USER moviehub_user WITH PASSWORD 'moviehub123';
      RAISE NOTICE 'User moviehub_user created';
   ELSE
      RAISE NOTICE 'User moviehub_user already exists';
   END IF;
END
$$;

-- Create database
SELECT 'CREATE DATABASE moviehub OWNER moviehub_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'moviehub')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE moviehub TO moviehub_user;

-- Connect to moviehub database
\c moviehub

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO moviehub_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO moviehub_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO moviehub_user;

-- Confirm setup
\echo ''
\echo '✅ Database setup complete!'
\echo 'Database: moviehub'
\echo 'User: moviehub_user'
\echo 'Password: moviehub123'
\echo ''
\echo 'Connection string:'
\echo 'postgresql://moviehub_user:moviehub123@localhost:5432/moviehub'
\echo ''


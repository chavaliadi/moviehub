#!/bin/bash

# Database setup script for MovieHub
# This script creates the PostgreSQL database and user

echo "🗄️  MovieHub Database Setup"
echo "======================================"
echo ""

# Database configuration
DB_NAME="moviehub"
DB_USER="moviehub_user"
DB_PASSWORD="moviehub123"

echo "This script will:"
echo "  1. Create PostgreSQL database: $DB_NAME"
echo "  2. Create database user: $DB_USER"
echo "  3. Grant privileges to the user"
echo ""
echo "⚠️  Make sure PostgreSQL is installed and running!"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo "Install PostgreSQL:"
    echo "  - macOS: brew install postgresql@15"
    echo "  - Or download from: https://www.postgresql.org/download/"
    exit 1
fi

# Create database and user
echo ""
echo "📝 Creating database and user..."
echo ""

# Run psql commands
psql postgres << EOF
-- Create user if not exists
DO
\$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$DB_USER') THEN
      CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
      RAISE NOTICE 'User $DB_USER created';
   ELSE
      RAISE NOTICE 'User $DB_USER already exists';
   END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to the database and grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;

\q
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "Database details:"
    echo "  - Name: $DB_NAME"
    echo "  - User: $DB_USER"
    echo "  - Password: $DB_PASSWORD"
    echo "  - Connection URL: postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
    echo ""
    echo "Next steps:"
    echo "  1. Run: python init_db.py (to create tables)"
    echo "  2. Install packages: pip install -r requirements.txt"
    echo "  3. Start backend: python run.py"
else
    echo ""
    echo "❌ Database setup failed!"
    echo "Make sure PostgreSQL is running: brew services start postgresql@15"
fi


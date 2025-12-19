"""
Verify database connection and tables.
Run this after setting up the database to ensure everything works.
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text

# Load environment variables
load_dotenv()


def verify_database():
    """Verify database connection and structure."""
    print("🔍 Verifying database setup...\n")
    
    database_url = os.getenv('DATABASE_URL')
    print(f"📦 Database URL: {database_url}\n")
    
    try:
        # Create engine
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL")
            print(f"   Version: {version[:50]}...\n")
            
            # Check tables
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            
            print(f"📋 Tables found: {len(tables)}")
            for table in tables:
                print(f"   - {table}")
                
                # Get columns for each table
                columns = inspector.get_columns(table)
                print(f"     Columns ({len(columns)}):")
                for col in columns:
                    print(f"       • {col['name']} ({col['type']})")
                print()
            
            if 'users' not in tables or 'favorites' not in tables:
                print("⚠️  Missing tables! Run: python init_db.py")
                return False
            
            print("✅ Database setup is complete and working!")
            print("\nNext steps:")
            print("  1. Set up Google OAuth credentials")
            print("  2. Add auth API endpoints")
            print("  3. Test authentication flow")
            return True
            
    except Exception as e:
        print(f"❌ Database connection failed!")
        print(f"   Error: {str(e)}\n")
        print("Troubleshooting:")
        print("  1. Make sure PostgreSQL is running: brew services list")
        print("  2. Check if database exists: psql postgres -c '\\l'")
        print("  3. Verify .env file has correct DATABASE_URL")
        print("  4. Run setup: psql postgres -f database_setup.sql")
        return False


if __name__ == '__main__':
    verify_database()


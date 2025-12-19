"""
Database initialization script.
Run this script to create the database tables.

Usage:
    python init_db.py
"""
from flask import Flask
from app.db import init_db, create_tables
from app.models import User, Favorite
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def main():
    """Initialize database and create tables."""
    print("🚀 Initializing database...")
    
    # Create Flask app
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    # Initialize database
    db = init_db(app)
    
    print(f"📦 Connected to database: {os.getenv('DATABASE_URL')}")
    print(f"📋 Creating tables for models: User, Favorite")
    
    # Create all tables
    create_tables(app)
    
    print("\n✅ Database initialization complete!")
    print("\nNext steps:")
    print("  1. Start the Flask backend: python run.py")
    print("  2. Test the database connection")
    print("  3. Set up Google OAuth credentials")


if __name__ == '__main__':
    main()


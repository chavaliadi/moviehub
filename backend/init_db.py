"""
Database initialization script.
Run this script to create the database tables.

Usage:
    python init_db.py
"""
from flask import Flask
from app.db import init_db, create_tables
from app import create_app
from app.models import User, Favorite
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def main():
    """Initialize database and create tables."""
    print("🚀 Initializing database...")
    
    # Create Flask app
    app = create_app()
    
    # Database is already initialized in create_app
    # db = init_db(app) 
    # But we need access to the db object to create tables
    from app.db import db
    
    print(f"📦 Connected to database: {app.config.get('SQLALCHEMY_DATABASE_URI')}")
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


"""
Database configuration and initialization module.
"""
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


# Initialize SQLAlchemy
db = SQLAlchemy()


def init_db(app):
    """
    Initialize database with Flask app.

    Args:
        app: Flask application instance
    """
    # Database configuration
    # Respect app config first (set by config class), then fall back to env/defaults.
    if not app.config.get('SQLALCHEMY_DATABASE_URI'):
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            # Default to a local SQLite DB for dev convenience
            database_url = 'sqlite:///moviehub_dev.db'
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url

    app.config.setdefault('SQLALCHEMY_TRACK_MODIFICATIONS', False)
    app.config['SQLALCHEMY_ECHO'] = os.getenv(
        'FLASK_ENV') == 'development'  # Log SQL queries in dev

    # Initialize db with app
    db.init_app(app)

    return db


def create_tables(app):
    """
    Create all database tables.

    Args:
        app: Flask application instance
    """
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")


def drop_tables(app):
    """
    Drop all database tables (use with caution!).

    Args:
        app: Flask application instance
    """
    with app.app_context():
        db.drop_all()
        print("⚠️ All database tables dropped!")

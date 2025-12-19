"""
Database configuration and initialization module.
"""
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


# Initialize SQLAlchemy with custom base class
db = SQLAlchemy(model_class=Base)


def init_db(app):
    """
    Initialize database with Flask app.
    
    Args:
        app: Flask application instance
    """
    # Database configuration
    database_url = os.getenv('DATABASE_URL', 'postgresql://moviehub_user:moviehub123@localhost:5432/moviehub')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = os.getenv('FLASK_ENV') == 'development'  # Log SQL queries in dev
    
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


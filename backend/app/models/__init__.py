"""
Models package - exports all database models.
"""
from app.models.user import User
from app.models.favorite import Favorite

__all__ = ['User', 'Favorite']


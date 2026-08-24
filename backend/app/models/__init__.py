"""
Models package - exports all database models.
"""
from app.models.user import User
from app.models.favorite import Favorite
from app.models.rating import Rating
from app.models.watchlist import Watchlist

__all__ = ['User', 'Favorite', 'Rating', 'Watchlist']


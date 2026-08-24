"""
Watchlist model for storing movies a user wants to watch.
"""
from datetime import datetime
from app.db import db
from sqlalchemy import UniqueConstraint


class Watchlist(db.Model):
    """Watchlist model for storing user's planned movies."""
    
    __tablename__ = 'watchlists'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    imdb_id = db.Column(db.String(50), nullable=False, index=True)
    movie_title = db.Column(db.String(500))
    movie_poster = db.Column(db.String(500))
    movie_year = db.Column(db.String(10))
    movie_type = db.Column(db.String(50))  # movie, series, episode
    added_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship with user
    user = db.relationship('User', back_populates='watchlists')
    
    # Ensure user can't add same movie twice
    __table_args__ = (
        UniqueConstraint('user_id', 'imdb_id', name='unique_user_watchlist'),
        {'extend_existing': True}
    )
    
    def __repr__(self):
        return f'<Watchlist user_id={self.user_id} imdb_id={self.imdb_id}>'
    
    def to_dict(self):
        """Convert watchlist object to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'imdb_id': self.imdb_id,
            'movie_title': self.movie_title,
            'movie_poster': self.movie_poster,
            'movie_year': self.movie_year,
            'movie_type': self.movie_type,
            'added_at': self.added_at.isoformat() if self.added_at else None,
        }
    
    @staticmethod
    def add_to_watchlist(user_id, imdb_id, movie_title, movie_poster, movie_year, movie_type='movie'):
        """
        Add a movie to user's watchlist.
        
        Args:
            user_id: User ID
            imdb_id: IMDb ID of the movie
            movie_title: Title of the movie
            movie_poster: URL to movie poster
            movie_year: Release year
            movie_type: Type of content (movie, series, etc.)
            
        Returns:
            Watchlist object or None if already exists
        """
        # Check if already in watchlist
        existing = Watchlist.query.filter_by(user_id=user_id, imdb_id=imdb_id).first()
        if existing:
            return None
        
        watchlist_item = Watchlist(
            user_id=user_id,
            imdb_id=imdb_id,
            movie_title=movie_title,
            movie_poster=movie_poster,
            movie_year=movie_year,
            movie_type=movie_type
        )
        db.session.add(watchlist_item)
        db.session.commit()
        return watchlist_item
    
    @staticmethod
    def remove_from_watchlist(user_id, imdb_id):
        """
        Remove a movie from user's watchlist.
        
        Args:
            user_id: User ID
            imdb_id: IMDb ID of the movie
            
        Returns:
            True if removed, False if not found
        """
        watchlist_item = Watchlist.query.filter_by(user_id=user_id, imdb_id=imdb_id).first()
        if watchlist_item:
            db.session.delete(watchlist_item)
            db.session.commit()
            return True
        return False
    
    @staticmethod
    def get_user_watchlist(user_id):
        """
        Get all watchlist items for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of Watchlist objects
        """
        return Watchlist.query.filter_by(user_id=user_id).order_by(Watchlist.added_at.desc()).all()
    
    @staticmethod
    def is_in_watchlist(user_id, imdb_id):
        """
        Check if a movie is in user's watchlist.
        
        Args:
            user_id: User ID
            imdb_id: IMDb ID of the movie
            
        Returns:
            True if in watchlist, False otherwise
        """
        return Watchlist.query.filter_by(user_id=user_id, imdb_id=imdb_id).first() is not None

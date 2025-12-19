"""
Favorite model for storing user's favorite movies.
"""
from datetime import datetime
from app.db import db
from sqlalchemy import UniqueConstraint


class Favorite(db.Model):
    """Favorite model for storing user's favorite movies."""
    
    __tablename__ = 'favorites'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    imdb_id = db.Column(db.String(50), nullable=False, index=True)
    movie_title = db.Column(db.String(500))
    movie_poster = db.Column(db.String(500))
    movie_year = db.Column(db.String(10))
    movie_type = db.Column(db.String(50))  # movie, series, episode
    added_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship with user
    user = db.relationship('User', back_populates='favorites')
    
    # Ensure user can't favorite same movie twice
    __table_args__ = (
        UniqueConstraint('user_id', 'imdb_id', name='unique_user_favorite'),
    )
    
    def __repr__(self):
        return f'<Favorite user_id={self.user_id} imdb_id={self.imdb_id}>'
    
    def to_dict(self):
        """Convert favorite object to dictionary."""
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
    def add_favorite(user_id, imdb_id, movie_title, movie_poster, movie_year, movie_type='movie'):
        """
        Add a movie to user's favorites.
        
        Args:
            user_id: User ID
            imdb_id: IMDb ID of the movie
            movie_title: Title of the movie
            movie_poster: URL to movie poster
            movie_year: Release year
            movie_type: Type of content (movie, series, etc.)
            
        Returns:
            Favorite object or None if already exists
        """
        # Check if already favorited
        existing = Favorite.query.filter_by(user_id=user_id, imdb_id=imdb_id).first()
        if existing:
            return None
        
        favorite = Favorite(
            user_id=user_id,
            imdb_id=imdb_id,
            movie_title=movie_title,
            movie_poster=movie_poster,
            movie_year=movie_year,
            movie_type=movie_type
        )
        db.session.add(favorite)
        db.session.commit()
        return favorite
    
    @staticmethod
    def remove_favorite(user_id, imdb_id):
        """
        Remove a movie from user's favorites.
        
        Args:
            user_id: User ID
            imdb_id: IMDb ID of the movie
            
        Returns:
            True if removed, False if not found
        """
        favorite = Favorite.query.filter_by(user_id=user_id, imdb_id=imdb_id).first()
        if favorite:
            db.session.delete(favorite)
            db.session.commit()
            return True
        return False
    
    @staticmethod
    def get_user_favorites(user_id):
        """
        Get all favorites for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of Favorite objects
        """
        return Favorite.query.filter_by(user_id=user_id).order_by(Favorite.added_at.desc()).all()
    
    @staticmethod
    def is_favorited(user_id, imdb_id):
        """
        Check if a movie is favorited by user.
        
        Args:
            user_id: User ID
            imdb_id: IMDb ID of the movie
            
        Returns:
            True if favorited, False otherwise
        """
        return Favorite.query.filter_by(user_id=user_id, imdb_id=imdb_id).first() is not None


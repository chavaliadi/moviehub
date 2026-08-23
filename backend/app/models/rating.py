"""
Rating model for storing user's movie ratings.
"""
from datetime import datetime
from app.db import db
from sqlalchemy import UniqueConstraint


class Rating(db.Model):
    """Rating model for storing user's movie ratings."""
    
    __tablename__ = 'ratings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    imdb_id = db.Column(db.String(50), nullable=False, index=True)
    score = db.Column(db.Integer, nullable=False)
    movie_title = db.Column(db.String(500))
    movie_poster = db.Column(db.String(500))
    movie_year = db.Column(db.String(10))
    movie_type = db.Column(db.String(50))  # movie, series, episode
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship with user
    user = db.relationship('User', backref=db.backref('ratings', lazy=True, cascade='all, delete-orphan'))
    
    # Ensure user can't rate same movie twice
    __table_args__ = (
        UniqueConstraint('user_id', 'imdb_id', name='unique_user_rating'),
        {'extend_existing': True}
    )
    
    def __repr__(self):
        return f'<Rating user_id={self.user_id} imdb_id={self.imdb_id} score={self.score}>'
    
    def to_dict(self):
        """Convert rating object to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'imdb_id': self.imdb_id,
            'score': self.score,
            'movie_title': self.movie_title,
            'movie_poster': self.movie_poster,
            'movie_year': self.movie_year,
            'movie_type': self.movie_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    @staticmethod
    def upsert_rating(user_id, imdb_id, score, movie_title='', movie_poster='', movie_year='', movie_type='movie'):
        """
        Create or update a user's movie rating.
        
        Args:
            user_id: User ID
            imdb_id: IMDb ID of the movie
            score: Rating score (1-5)
            movie_title: Title of the movie
            movie_poster: URL to movie poster
            movie_year: Release year
            movie_type: Type of content (movie, series, etc.)
            
        Returns:
            Rating object
        """
        rating = Rating.query.filter_by(user_id=user_id, imdb_id=imdb_id).first()
        
        if rating:
            rating.score = score
        else:
            rating = Rating(
                user_id=user_id,
                imdb_id=imdb_id,
                score=score,
                movie_title=movie_title,
                movie_poster=movie_poster,
                movie_year=movie_year,
                movie_type=movie_type
            )
            db.session.add(rating)
            
        db.session.commit()
        return rating
    
    @staticmethod
    def remove_rating(user_id, imdb_id):
        """
        Remove a user's rating for a movie.
        
        Args:
            user_id: User ID
            imdb_id: IMDb ID of the movie
            
        Returns:
            True if removed, False if not found
        """
        rating = Rating.query.filter_by(user_id=user_id, imdb_id=imdb_id).first()
        if rating:
            db.session.delete(rating)
            db.session.commit()
            return True
        return False
    
    @staticmethod
    def get_user_ratings(user_id):
        """
        Get all ratings for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of Rating objects
        """
        return Rating.query.filter_by(user_id=user_id).order_by(Rating.updated_at.desc()).all()

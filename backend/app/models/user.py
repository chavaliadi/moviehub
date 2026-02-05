"""
User model for authentication and user management.
"""
from datetime import datetime
from app.db import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash


class User(UserMixin, db.Model):
    """User model for storing user information."""
    
    __tablename__ = 'users'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255))
    google_id = db.Column(db.String(255), unique=True, index=True)
    password_hash = db.Column(db.String(500))
    profile_picture = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with favorites
    favorites = db.relationship('Favorite', back_populates='user', cascade='all, delete-orphan', lazy='dynamic')
    
    def set_password(self, password):
        """Hash and set user password."""
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        """Check if password matches hash."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.email}>'
    
    def to_dict(self):
        """Convert user object to dictionary."""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'profile_picture': self.profile_picture,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
        }
    
    @staticmethod
    def get_or_create(google_id, email, name, profile_picture):
        """
        Get existing user or create new one from Google OAuth data.
        
        Args:
            google_id: Google user ID
            email: User email
            name: User name
            profile_picture: URL to profile picture
            
        Returns:
            User object
        """
        user = User.query.filter_by(google_id=google_id).first()
        
        if user:
            # Update user information
            user.name = name
            user.email = email
            user.profile_picture = profile_picture
            user.last_login = datetime.utcnow()
        else:
            # Create new user
            user = User(
                google_id=google_id,
                email=email,
                name=name,
                profile_picture=profile_picture
            )
            db.session.add(user)
        
        db.session.commit()
        return user


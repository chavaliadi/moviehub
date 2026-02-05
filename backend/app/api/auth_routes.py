from flask import Blueprint, redirect, url_for, session, current_app, jsonify, request
from authlib.integrations.flask_client import OAuth
from flask_login import login_user, logout_user, login_required, current_user
from app.models import User
from app.db import db
from datetime import datetime

auth_bp = Blueprint('auth', __name__)
oauth = OAuth()

# ... (Previous Google Auth code remains for backward compatibility or potential future use) ...
# Actually, I should probably remove it or comment it out if user asked to "use simple login auth and not google auth"
# But I will keep the structure clean.

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user with email and password."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    if not email or not password or not name:
        return jsonify({'error': 'Missing required fields'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
        
    user = User(
        email=email,
        name=name,
        profile_picture=f"https://ui-avatars.com/api/?name={name}&background=random"
    )
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    login_user(user)
    
    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login with email and password."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400
        
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
        
    login_user(user)
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict()
    })

# Keep GET /login for Google redirection commented out or removed? 
# User said "not google auth". I will prioritize the POST /login for simple auth.
# If I keep GET /login it might conflict if names collide, but one is GET one is POST.
# The previous code had `def login()` for GET. I should rename that or just remove it if strictly simple auth.
# To be safe, I'll remove the Google routes for now to avoid confusion, or rename them.

@auth_bp.route('/logout')
@login_required
def logout():
    """Logout user"""
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@auth_bp.route('/me')
def me():
    """Get current user info"""
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': current_user.to_dict()
        })
    return jsonify({
        'authenticated': False,
        'user': None
    })
@auth_bp.route('/update', methods=['PUT'])
@login_required
def update_profile():
    """Update user profile information."""
    data = request.get_json()
    name = data.get('name')
    
    if not name:
        return jsonify({'error': 'Name is required'}), 400
        
    current_user.name = name
    # Optional: Update avatar logic if we had image upload, but for now just name or regen avatar
    current_user.profile_picture = f"https://ui-avatars.com/api/?name={name}&background=random"
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': current_user.to_dict()
    })

@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """Change user password."""
    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    
    if not current_password or not new_password:
        return jsonify({'error': 'All fields are required'}), 400
        
    if not current_user.check_password(current_password):
        return jsonify({'error': 'Incorrect current password'}), 401
        
    current_user.set_password(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'})


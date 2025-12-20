from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models.favorite import Favorite
from app.db import db

favorites_bp = Blueprint('favorites', __name__)

@favorites_bp.route('/', methods=['GET'])
@login_required
def get_favorites():
    """Get user's favorite movies"""
    favorites = Favorite.get_user_favorites(current_user.id)
    return jsonify([fav.to_dict() for fav in favorites])

@favorites_bp.route('/', methods=['POST'])
@login_required
def add_favorite():
    """Add a movie to favorites"""
    data = request.get_json()
    
    if not data or 'imdb_id' not in data:
        return jsonify({'error': 'Missing imdb_id'}), 400
        
    favorite = Favorite.add_favorite(
        user_id=current_user.id,
        imdb_id=data.get('imdb_id'),
        movie_title=data.get('title'),
        movie_poster=data.get('poster_path'), # Frontend sends 'poster_path' usually
        movie_year=data.get('release_date', '')[:4] if data.get('release_date') else '',
        movie_type=data.get('media_type', 'movie')
    )
    
    if not favorite:
        return jsonify({'message': 'Movie already in favorites'}), 200
        
    return jsonify(favorite.to_dict()), 201

@favorites_bp.route('/<imdb_id>', methods=['DELETE'])
@login_required
def remove_favorite(imdb_id):
    """Remove a movie from favorites"""
    success = Favorite.remove_favorite(current_user.id, imdb_id)
    
    if success:
        return jsonify({'message': 'Removed from favorites'}), 200
    return jsonify({'error': 'Favorite not found'}), 404

@favorites_bp.route('/check/<imdb_id>', methods=['GET'])
@login_required
def check_favorite(imdb_id):
    """Check if a movie is favorited"""
    is_fav = Favorite.is_favorited(current_user.id, imdb_id)
    return jsonify({'is_favorited': is_fav})

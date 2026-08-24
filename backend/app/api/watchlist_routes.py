from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models.watchlist import Watchlist
from app.db import db

watchlist_bp = Blueprint('watchlist', __name__)

@watchlist_bp.route('/', methods=['GET'])
@login_required
def get_watchlist():
    """Get user's watchlist movies"""
    watchlist = Watchlist.get_user_watchlist(current_user.id)
    return jsonify([item.to_dict() for item in watchlist])

@watchlist_bp.route('/', methods=['POST'])
@login_required
def add_to_watchlist():
    """Add a movie to watchlist"""
    data = request.get_json()
    
    if not data or 'imdb_id' not in data:
        return jsonify({'error': 'Missing imdb_id'}), 400
        
    watchlist_item = Watchlist.add_to_watchlist(
        user_id=current_user.id,
        imdb_id=data.get('imdb_id'),
        movie_title=data.get('title'),
        movie_poster=data.get('poster_path'), # Frontend sends 'poster_path' usually
        movie_year=data.get('release_date', '')[:4] if data.get('release_date') else '',
        movie_type=data.get('media_type', 'movie')
    )
    
    if not watchlist_item:
        return jsonify({'message': 'Movie already in watchlist'}), 200
        
    return jsonify(watchlist_item.to_dict()), 201

@watchlist_bp.route('/<imdb_id>', methods=['DELETE'])
@login_required
def remove_from_watchlist(imdb_id):
    """Remove a movie from watchlist"""
    success = Watchlist.remove_from_watchlist(current_user.id, imdb_id)
    
    if success:
        return jsonify({'message': 'Removed from watchlist'}), 200
    return jsonify({'error': 'Watchlist item not found'}), 404

@watchlist_bp.route('/check/<imdb_id>', methods=['GET'])
@login_required
def check_watchlist(imdb_id):
    """Check if a movie is in watchlist"""
    in_watchlist = Watchlist.is_in_watchlist(current_user.id, imdb_id)
    return jsonify({'is_in_watchlist': in_watchlist})

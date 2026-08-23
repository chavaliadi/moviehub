from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models.rating import Rating
from app.db import db

ratings_bp = Blueprint('ratings', __name__)

@ratings_bp.route('/', methods=['GET'])
@login_required
def get_ratings():
    """Get user's movie ratings"""
    ratings = Rating.get_user_ratings(current_user.id)
    return jsonify([rating.to_dict() for rating in ratings])

@ratings_bp.route('/', methods=['POST'])
@login_required
def add_rating():
    """Create or update a movie rating"""
    data = request.get_json()
    
    if not data or 'imdb_id' not in data or 'score' not in data:
        return jsonify({'error': 'Missing imdb_id or score'}), 400
        
    try:
        score = int(data.get('score'))
        if score < 1 or score > 5:
            return jsonify({'error': 'Score must be between 1 and 5'}), 400
    except ValueError:
        return jsonify({'error': 'Score must be an integer'}), 400
        
    rating = Rating.upsert_rating(
        user_id=current_user.id,
        imdb_id=data.get('imdb_id'),
        score=score,
        movie_title=data.get('title'),
        movie_poster=data.get('poster_path'),
        movie_year=data.get('release_date', '')[:4] if data.get('release_date') else '',
        movie_type=data.get('media_type', 'movie')
    )
    
    return jsonify(rating.to_dict()), 201

@ratings_bp.route('/<imdb_id>', methods=['DELETE'])
@login_required
def remove_rating(imdb_id):
    """Remove a movie rating"""
    success = Rating.remove_rating(current_user.id, imdb_id)
    
    if success:
        return jsonify({'message': 'Removed rating'}), 200
    return jsonify({'error': 'Rating not found'}), 404

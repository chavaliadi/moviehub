from flask import Blueprint, jsonify

# Create blueprints
main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    """Main route - API information"""
    return jsonify({
        'message': 'Welcome to MovieHub Backend API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/health',
            'api_docs': '/api/',
            'ml_status': '/api/ml/status',
            'similar_by_title': '/api/ml/recommendations/movie/<title>',
            'similar_query': '/api/ml/recommendations/similar?title=Inception'
        }
    })

from flask_restful import Resource, Api
from app.services.recommendation_service import RecommendationService


class SimilarMoviesResource(Resource):
    """Resource for getting similar movies"""

    def __init__(self):
        self.recommendation_service = RecommendationService()

    def get(self):
        """GET /api/ml/recommendations/similar - Get similar movies by movie_id or title"""
        from flask import request

        movie_id = request.args.get('movie_id') or request.args.get('title')
        limit = request.args.get('limit', 10, type=int)

        if not movie_id:
            return {'error': 'movie_id or title parameter is required'}, 400

        result = self.recommendation_service.get_similar_movies(
            movie_id, limit=limit)
        return result, 200 if result['success'] else 400


class MovieRecommendationsResource(Resource):
    """Resource for getting movie recommendations by title"""

    def __init__(self):
        self.recommendation_service = RecommendationService()

    def get(self, movie_title):
        """GET /api/ml/recommendations/movie/<movie_title> - Get recommendations for a specific movie"""
        from flask import request

        limit = request.args.get('limit', 10, type=int)

        result = self.recommendation_service.get_similar_movies(
            movie_title, limit=limit)
        return result, 200 if result['success'] else 400


class SearchMoviesResource(Resource):
    """Resource for searching movies"""

    def __init__(self):
        self.recommendation_service = RecommendationService()

    def get(self):
        """GET /api/ml/search - Search movies by title"""
        from flask import request

        query = request.args.get('q')
        limit = request.args.get('limit', 10, type=int)

        if not query:
            return {'error': 'Query parameter "q" is required'}, 400

        try:
            # Use the ML system to search movies
            if self.recommendation_service.system_initialized and self.recommendation_service.recommendation_system:
                all_titles = self.recommendation_service.recommendation_system.movies_data['title'].tolist(
                )
                import difflib
                matches = difflib.get_close_matches(
                    query, all_titles, n=limit, cutoff=0.3)

                return {
                    'success': True,
                    'query': query,
                    'results': matches,
                    'total_found': len(matches)
                }
            else:
                return {'error': 'ML system not initialized'}, 503

        except Exception as e:
            return {'error': f'Search failed: {str(e)}'}, 500


class ModelStatusResource(Resource):
    """Resource for getting model status"""

    def __init__(self):
        self.recommendation_service = RecommendationService()

    def get(self):
        """GET /api/ml/status - Get model status"""
        result = self.recommendation_service.get_model_status()
        return result, 200


def init_app(api):
    """Initialize recommendation API resources"""
    api.add_resource(SimilarMoviesResource, '/ml/recommendations/similar')
    api.add_resource(MovieRecommendationsResource,
                     '/ml/recommendations/movie/<movie_title>')
    api.add_resource(SearchMoviesResource, '/ml/search')
    api.add_resource(ModelStatusResource, '/ml/status')

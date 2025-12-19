from flask_restful import Resource, Api
from app.services.movie_service import MovieService

class MovieListResource(Resource):
    """Resource for getting list of movies"""
    
    def __init__(self):
        self.movie_service = MovieService()
    
    def get(self):
        """GET /api/movies - Get movies with pagination"""
        from flask import request
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        result = self.movie_service.get_movies(page=page, limit=limit)
        return result, 200 if result['success'] else 400

class MovieSearchResource(Resource):
    """Resource for searching movies"""
    
    def __init__(self):
        self.movie_service = MovieService()
    
    def get(self):
        """GET /api/movies/search - Search movies by query"""
        from flask import request
        
        query = request.args.get('q', '')
        page = request.args.get('page', 1, type=int)
        
        if not query:
            return {'error': 'Query parameter is required'}, 400
        
        result = self.movie_service.search_movies(query, page=page)
        return result, 200 if result['success'] else 400

class MovieDetailResource(Resource):
    """Resource for getting movie details"""
    
    def __init__(self):
        self.movie_service = MovieService()
    
    def get(self, imdb_id):
        """GET /api/movies/<imdb_id> - Get movie details"""
        result = self.movie_service.get_movie_details(imdb_id)
        return result, 200 if result['success'] else 400

class RandomMoviesResource(Resource):
    """Resource for getting random movies"""
    
    def __init__(self):
        self.movie_service = MovieService()
    
    def get(self):
        """GET /api/movies/random - Get random selection of movies"""
        from flask import request
        
        count = request.args.get('count', 10, type=int)
        result = self.movie_service.get_random_movies(count=count)
        return result, 200 if result['success'] else 400

def init_app(api):
    """Initialize movie API resources"""
    api.add_resource(MovieListResource, '/movies')
    api.add_resource(MovieSearchResource, '/movies/search')
    api.add_resource(MovieDetailResource, '/movies/<string:imdb_id>')
    api.add_resource(RandomMoviesResource, '/movies/random')

import requests
import os
from typing import Dict, List, Optional

class MovieService:
    """Service class for handling movie-related operations"""
    
    def __init__(self):
        self.api_key = os.environ.get('OMDB_API_KEY', '18e217aa')
        self.base_url = 'http://www.omdbapi.com/'
    
    def search_movies(self, query: str, page: int = 1) -> Dict:
        """
        Search for movies using OMDB API
        
        Args:
            query (str): Search query
            page (int): Page number for pagination
            
        Returns:
            Dict: Search results with movies and metadata
        """
        try:
            params = {
                'apikey': self.api_key,
                's': query,
                'type': 'movie',
                'page': page
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('Response') == 'True':
                return {
                    'success': True,
                    'movies': data.get('Search', []),
                    'total_results': int(data.get('totalResults', 0)),
                    'page': page,
                    'total_pages': (int(data.get('totalResults', 0)) + 9) // 10
                }
            else:
                return {
                    'success': False,
                    'error': data.get('Error', 'No movies found'),
                    'movies': [],
                    'total_results': 0,
                    'page': page,
                    'total_pages': 0
                }
                
        except requests.RequestException as e:
            return {
                'success': False,
                'error': f'API request failed: {str(e)}',
                'movies': [],
                'total_results': 0,
                'page': page,
                'total_pages': 0
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}',
                'movies': [],
                'total_results': 0,
                'page': page,
                'total_pages': 0
            }
    
    def get_movie_details(self, imdb_id: str) -> Dict:
        """
        Get detailed information about a specific movie
        
        Args:
            imdb_id (str): IMDB ID of the movie
            
        Returns:
            Dict: Movie details
        """
        try:
            params = {
                'apikey': self.api_key,
                'i': imdb_id,
                'plot': 'full'
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('Response') == 'True':
                return {
                    'success': True,
                    'movie': data
                }
            else:
                return {
                    'success': False,
                    'error': data.get('Error', 'Movie not found')
                }
                
        except requests.RequestException as e:
            return {
                'success': False,
                'error': f'API request failed: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }
    
    def get_movies(self, page: int = 1, limit: int = 10) -> Dict:
        """
        Get popular movies (default search)
        
        Args:
            page (int): Page number
            limit (int): Number of movies per page
            
        Returns:
            Dict: Movies and metadata
        """
        # Default search for popular movies
        popular_queries = ['Avengers', 'Batman', 'Spider-Man', 'Star Wars']
        query = popular_queries[(page - 1) % len(popular_queries)]
        
        return self.search_movies(query, page)
    
    def get_random_movies(self, count: int = 10) -> Dict:
        """
        Get random selection of popular movies
        
        Args:
            count (int): Number of movies to return
            
        Returns:
            Dict: Random movies
        """
        import random
        
        popular_queries = [
            'Avengers', 'Batman', 'Spider-Man', 'Iron Man', 'Superman',
            'Wonder Woman', 'Black Panther', 'Thor', 'Captain America',
            'Jurassic Park', 'Star Wars', 'Lord of the Rings', 'Harry Potter'
        ]
        
        # Randomly select queries and get movies
        selected_queries = random.sample(popular_queries, min(count, len(popular_queries)))
        all_movies = []
        
        for query in selected_queries:
            result = self.search_movies(query, 1)
            if result['success']:
                all_movies.extend(result['movies'])
        
        # Shuffle and limit results
        random.shuffle(all_movies)
        
        return {
            'success': True,
            'movies': all_movies[:count],
            'total_results': len(all_movies[:count]),
            'page': 1,
            'total_pages': 1
        }

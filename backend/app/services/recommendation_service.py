# Defer importing the ML system until initialization to avoid path issues at import time
import sys
import json
import os
from typing import Dict, List, Optional
import time
MovieRecommendationSystem = None  # type: ignore

# Ensure repository root is importable for ML module
_CURRENT_DIR = os.path.dirname(__file__)
_REPO_ROOT = os.path.abspath(os.path.join(_CURRENT_DIR, '..', '..', '..'))
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)


class RecommendationService:
    """Service class for handling ML-based movie recommendations"""

    def __init__(self):
        self.model_path = os.environ.get('MODEL_PATH', 'models/')
        self.data_path = os.environ.get('DATA_PATH', 'data/')
        self.model_loaded = False
        self.recommendation_system = None
        self.system_initialized = False
        self._similar_cache = {}
        self._cache_ttl_seconds = int(os.environ.get('ML_CACHE_TTL', '900'))

        # Lazy initialization; defer heavy load until first request
        if os.environ.get('ML_EAGER_INIT', '0') == '1':
            self._initialize_system()

    def _initialize_system(self):
        """Initialize the ML recommendation system"""
        try:
            print("🚀 Initializing ML Recommendation System...")
            use_large = os.environ.get('ML_USE_LARGE_DATASET', '1') == '1'
            global MovieRecommendationSystem
            if MovieRecommendationSystem is None:
                # Import here to ensure sys.path is set
                from backend.ml_engine.movie_recommendation_optimized import MovieRecommendationSystem as _MRS
                MovieRecommendationSystem = _MRS
            self.recommendation_system = MovieRecommendationSystem(
                use_large_dataset=use_large)

            if self.recommendation_system.load_data():
                # Use env-configurable sample size (None = full dataset for accuracy)
                sample = os.environ.get('ML_SAMPLE_SIZE')
                sample_size = int(sample) if sample and sample.isdigit() else None  # Use full dataset
                if self.recommendation_system.train_model(sample_size=sample_size):
                    self.model_loaded = True
                    self.system_initialized = True
                    print("✅ ML System initialized successfully!")
                else:
                    print("❌ Failed to train model")
            else:
                print("❌ Failed to load data")

        except Exception as e:
            print(f"❌ Error initializing ML system: {e}")
            self.model_loaded = False
            self.system_initialized = False

    # Removed user-based recommendations stub to keep service minimal

    def get_similar_movies(self, movie_id: str, limit: int = 10) -> Dict:
        """
        Get movies similar to a given movie

        Args:
            movie_id (str): Movie identifier or title
            limit (int): Number of similar movies to return

        Returns:
            Dict: List of similar movies
        """
        if not self.system_initialized:
            # Attempt on-demand initialization
            self._initialize_system()
        if not self.system_initialized:
            return {
                'success': False,
                'error': 'ML system not initialized',
                'movie_id': movie_id,
                'similar_movies': [],
                'model_status': 'not_ready'
            }

        try:
            # Simple in-memory cache to speed up repeated requests
            cache_key = f"{movie_id}:{limit}"
            now = time.time()
            cached = self._similar_cache.get(cache_key)
            if cached and now - cached['ts'] < self._cache_ttl_seconds:
                return cached['data']
            # Accept movie title directly (from favourites) or map id->title
            movie_title = self._get_movie_title_from_id(movie_id)
            if not movie_title:
                return {
                    'success': False,
                    'error': f'Movie not found: {movie_id}',
                    'movie_id': movie_id,
                    'similar_movies': [],
                    'model_status': 'error'
                }

            # Get recommendations using our ML system
            recommendations = self.recommendation_system.get_recommendations(
                movie_title, limit)

            if not recommendations:
                return {
                    'success': False,
                    'error': f'No recommendations found for {movie_title}',
                    'movie_id': movie_id,
                    'similar_movies': [],
                    'model_status': 'no_results'
                }

            # Format the response
            similar_movies = []
            for rec in recommendations:
                similar_movies.append({
                    'title': rec['title'],
                    'similarity_score': rec['similarity_score'],
                    'rank': rec['rank']
                })

            result = {
                'success': True,
                'movie_id': movie_id,
                'movie_title': movie_title,
                'similar_movies': similar_movies,
                'total_found': len(similar_movies),
                'model_status': 'ready'
            }
            # store to cache
            self._similar_cache[cache_key] = {'ts': now, 'data': result}
            return result

        except Exception as e:
            return {
                'success': False,
                'error': f'Error getting recommendations: {str(e)}',
                'movie_id': movie_id,
                'similar_movies': [],
                'model_status': 'error'
            }

    def _get_movie_title_from_id(self, movie_id: str) -> Optional[str]:
        """Get movie title from ID or return the ID if it's already a title"""
        if not self.recommendation_system:
            return None

        try:
            # Prefer full dataset for robust matching if available
            source_df = None
            if hasattr(self.recommendation_system, 'full_movies_data') and self.recommendation_system.full_movies_data is not None:
                source_df = self.recommendation_system.full_movies_data
            elif self.recommendation_system.movies_data is not None:
                source_df = self.recommendation_system.movies_data
            else:
                return None

            # Check if it's a numeric ID
            if movie_id.isdigit():
                if 'id' in source_df.columns:
                    movie_data = source_df[source_df['id'] == int(movie_id)]
                else:
                    movie_data = None
                if not movie_data.empty:
                    return movie_data.iloc[0]['title']

            # Check if it's a title
            movie_data = source_df[source_df['title'] == movie_id]
            if not movie_data.empty:
                return movie_id

            # Some OMDB ids start with tt...; small dataset may not have ids, so fallback to fuzzy title match
            if movie_id.startswith('tt'):
                # With only title info available, return None here and rely on fuzzy match fallback below
                pass

            # Try fuzzy matching
            all_titles = source_df['title'].tolist()
            import difflib
            matches = difflib.get_close_matches(
                movie_id, all_titles, n=1, cutoff=0.3)
            if matches:
                return matches[0]

            return None

        except Exception as e:
            print(f"Error getting movie title: {e}")
            return None

    # Removed training and preprocessing endpoints to keep minimal

    def load_model(self) -> bool:
        """
        Load the trained recommendation model

        Returns:
            bool: True if model loaded successfully
        """
        # TODO: Implement model loading
        # This will load pre-trained models from disk

        try:
            # Placeholder for model loading logic
            self.model_loaded = True
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model_loaded = False
            return False

    def get_model_status(self) -> Dict:
        """
        Get the current status of the ML model

        Returns:
            Dict: Model status information
        """
        status_info = {
            'model_loaded': self.model_loaded,
            'system_initialized': self.system_initialized,
            'model_path': self.model_path,
            'data_path': self.data_path,
            'status': 'development' if not self.model_loaded else 'ready'
        }

        # Add ML system info if available
        if self.recommendation_system:
            status_info.update({
                'movies_available': len(self.recommendation_system.movies_data) if self.recommendation_system.movies_data else 0,
                'features_used': self.recommendation_system.feature_columns if hasattr(self.recommendation_system, 'feature_columns') else [],
                'dataset_type': 'TMDB Large Dataset' if self.recommendation_system.use_large_dataset else 'Original Dataset',
                'is_trained': self.recommendation_system.is_trained
            })

        return status_info

    # Removed preprocess stub

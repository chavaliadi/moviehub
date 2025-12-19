"""
Quick Integration Script for Movie Recommendation API
Integrates with your existing movie API backend
"""

from movie_recommendation_optimized import MovieRecommendationSystem
import json

class RecommendationAPI:
    def __init__(self):
        self.recommendation_system = None
        self.is_ready = False
    
    def initialize_system(self, use_large_dataset=True, sample_size=50000):
        """
        Initialize the recommendation system
        Use sample_size=50000 for 1-hour deadline (good balance of speed vs quality)
        """
        print("🚀 Initializing Recommendation API...")
        
        try:
            # Initialize with optimized settings
            self.recommendation_system = MovieRecommendationSystem(use_large_dataset=use_large_dataset)
            
            # Load data
            if not self.recommendation_system.load_data():
                return False
            
            # Train with sample for speed (50K movies is still excellent)
            if not self.recommendation_system.train_model(sample_size=sample_size):
                return False
            
            self.is_ready = True
            print("✅ Recommendation API ready!")
            return True
            
        except Exception as e:
            print(f"❌ Failed to initialize: {e}")
            return False
    
    def get_recommendations(self, movie_title, num_recommendations=10):
        """
        Get recommendations for a movie
        
        Args:
            movie_title: Title of the movie
            num_recommendations: Number of recommendations (default: 10)
            
        Returns:
            JSON response with recommendations
        """
        if not self.is_ready:
            return {
                "error": "Recommendation system not initialized",
                "status": "error"
            }
        
        try:
            recommendations = self.recommendation_system.get_recommendations(
                movie_title, 
                num_recommendations
            )
            
            if not recommendations:
                return {
                    "error": f"No recommendations found for '{movie_title}'",
                    "status": "not_found",
                    "suggestions": self._get_similar_titles(movie_title)
                }
            
            return {
                "movie_title": movie_title,
                "recommendations": recommendations,
                "total_found": len(recommendations),
                "status": "success"
            }
            
        except Exception as e:
            return {
                "error": f"Error getting recommendations: {str(e)}",
                "status": "error"
            }
    
    def _get_similar_titles(self, movie_title, limit=5):
        """Get similar movie titles for suggestions"""
        if not self.recommendation_system or not self.recommendation_system.movies_data:
            return []
        
        try:
            all_titles = self.recommendation_system.movies_data['title'].tolist()
            similar_titles = difflib.get_close_matches(movie_title, all_titles, n=limit, cutoff=0.3)
            return similar_titles
        except:
            return []
    
    def get_movie_info(self, movie_title):
        """Get basic info about a movie"""
        if not self.is_ready:
            return None
        
        try:
            movie_data = self.recommendation_system.movies_data[
                self.recommendation_system.movies_data['title'] == movie_title
            ]
            
            if not movie_data.empty:
                return movie_data.iloc[0].to_dict()
            return None
        except:
            return None
    
    def search_movies(self, query, limit=10):
        """Search for movies by title"""
        if not self.is_ready:
            return []
        
        try:
            all_titles = self.recommendation_system.movies_data['title'].tolist()
            matches = [title for title in all_titles if query.lower() in title.lower()]
            return matches[:limit]
        except:
            return []

# Flask API Integration Example
def create_flask_endpoints(app, recommendation_api):
    """
    Add recommendation endpoints to your existing Flask app
    """
    
    @app.route('/api/recommendations/<movie_title>', methods=['GET'])
    def get_recommendations_endpoint(movie_title):
        """Get recommendations for a movie"""
        num_recommendations = request.args.get('limit', 10, type=int)
        result = recommendation_api.get_recommendations(movie_title, num_recommendations)
        return json.dumps(result, indent=2)
    
    @app.route('/api/search', methods=['GET'])
    def search_movies_endpoint():
        """Search for movies"""
        query = request.args.get('q', '')
        limit = request.args.get('limit', 10, type=int)
        
        if not query:
            return json.dumps({"error": "Query parameter 'q' is required"}, status=400)
        
        results = recommendation_api.search_movies(query, limit)
        return json.dumps({
            "query": query,
            "results": results,
            "total": len(results)
        })
    
    @app.route('/api/movie/<movie_title>', methods=['GET'])
    def get_movie_info_endpoint(movie_title):
        """Get movie information"""
        info = recommendation_api.get_movie_info(movie_title)
        
        if info:
            return json.dumps(info)
        else:
            return json.dumps({"error": "Movie not found"}, status=404)

# Quick test function
def quick_test():
    """Quick test of the recommendation system"""
    print("🧪 Running quick test...")
    
    # Initialize API
    api = RecommendationAPI()
    
    # Initialize with sample for speed
    if api.initialize_system(use_large_dataset=True, sample_size=20000):
        
        # Test recommendations
        test_movies = ["Avatar", "Inception", "The Dark Knight", "Iron Man"]
        
        for movie in test_movies:
            print(f"\n🎬 Testing: {movie}")
            result = api.get_recommendations(movie, 5)
            
            if result.get("status") == "success":
                print(f"✅ Found {result['total_found']} recommendations")
                for rec in result['recommendations'][:3]:
                    print(f"   • {rec['title']} ({rec['similarity_score']:.3f})")
            else:
                print(f"❌ {result.get('error', 'Unknown error')}")
        
        print("\n✅ Quick test completed!")
        return True
    
    return False

if __name__ == "__main__":
    quick_test()

import sys
import os
import json

# Add project root to path
current_dir = os.getcwd()
sys.path.append(current_dir)
# Also add backend to path if needed for relative imports within backend
sys.path.append(os.path.join(current_dir, 'backend'))

from backend.app.services.recommendation_service import RecommendationService

# Set env vars
os.environ['ML_LOAD_LIMIT'] = '50000'
os.environ['ML_EAGER_INIT'] = '1' # Force init

def test_recommendations():
    print("Initializing service...")
    try:
        svc = RecommendationService()
        svc._initialize_system()
        
        movies = ['Salaar: Part 1 - Ceasefire', 'Pokiri', 'Avatar']
        
        for movie in movies:
            print(f"\n--- Testing: {movie} ---")
            result = svc.get_similar_movies(movie, limit=5)
            # clean output for clarity
            if result.get('success'):
                print(f"Success! Found {len(result['similar_movies'])} recommendations.")
                for rec in result['similar_movies']:
                    print(f"  - {rec['title']} ({rec['similarity_score']:.2f})")
            else:
                print(f"Failed: {result.get('error')}")
                
    except Exception as e:
        print(f"CRITICAL FAILURE: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_recommendations()

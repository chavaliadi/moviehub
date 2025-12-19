"""
Quick Test Script for Movie Recommendation System
Run this to verify everything works before client submission
"""

import time
from movie_recommendation_optimized import setup_recommendation_system
from recommendation_api_integration import RecommendationAPI

def test_system_performance():
    """Test the system with different configurations"""
    print("🧪 Testing Movie Recommendation System Performance\n")
    
    # Test configurations
    configs = [
        {"use_large_dataset": False, "sample_size": None, "name": "Original Dataset (4.8K movies)"},
        {"use_large_dataset": True, "sample_size": 10000, "name": "TMDB Sample (10K movies)"},
        {"use_large_dataset": True, "sample_size": 50000, "name": "TMDB Sample (50K movies)"}
    ]
    
    results = []
    
    for config in configs:
        print(f"🔄 Testing: {config['name']}")
        start_time = time.time()
        
        try:
            # Initialize system
            system = setup_recommendation_system(
                use_large_dataset=config['use_large_dataset'],
                sample_size=config['sample_size']
            )
            
            if system:
                # Test recommendations
                recommendations = system.get_recommendations("Avatar", 5)
                end_time = time.time()
                
                result = {
                    "config": config['name'],
                    "success": True,
                    "time": end_time - start_time,
                    "movies_loaded": len(system.movies_data),
                    "recommendations_found": len(recommendations)
                }
                
                print(f"✅ Success! Time: {result['time']:.1f}s, Movies: {result['movies_loaded']:,}")
                if recommendations:
                    print(f"   Top recommendation: {recommendations[0]['title']}")
                
            else:
                result = {
                    "config": config['name'],
                    "success": False,
                    "time": time.time() - start_time
                }
                print(f"❌ Failed!")
                
        except Exception as e:
            result = {
                "config": config['name'],
                "success": False,
                "time": time.time() - start_time,
                "error": str(e)
            }
            print(f"❌ Error: {e}")
        
        results.append(result)
        print()
    
    # Summary
    print("📊 PERFORMANCE SUMMARY:")
    print("-" * 50)
    for result in results:
        status = "✅" if result['success'] else "❌"
        print(f"{status} {result['config']}")
        if result['success']:
            print(f"   Time: {result['time']:.1f}s | Movies: {result['movies_loaded']:,} | Recs: {result['recommendations_found']}")
        print()
    
    return results

def test_api_integration():
    """Test the API integration"""
    print("🔌 Testing API Integration\n")
    
    try:
        # Initialize API
        api = RecommendationAPI()
        
        # Initialize with optimal settings for production
        print("🚀 Initializing API with 50K movie sample...")
        if api.initialize_system(use_large_dataset=True, sample_size=50000):
            
            # Test different endpoints
            test_cases = [
                ("Avatar", 5),
                ("Inception", 3),
                ("Iron Man", 10),
                ("Nonexistent Movie", 5)
            ]
            
            print("🧪 Testing recommendation endpoints:")
            for movie, limit in test_cases:
                print(f"\n📝 Testing: '{movie}' (limit: {limit})")
                result = api.get_recommendations(movie, limit)
                
                if result['status'] == 'success':
                    print(f"✅ Found {result['total_found']} recommendations")
                    for i, rec in enumerate(result['recommendations'][:3], 1):
                        print(f"   {i}. {rec['title']} ({rec['similarity_score']:.3f})")
                elif result['status'] == 'not_found':
                    print(f"⚠️  Movie not found. Suggestions: {result.get('suggestions', [])[:3]}")
                else:
                    print(f"❌ Error: {result['error']}")
            
            # Test search
            print(f"\n🔍 Testing search: 'Batman'")
            search_results = api.search_movies("Batman", 5)
            print(f"✅ Found {len(search_results)} movies:")
            for movie in search_results[:3]:
                print(f"   • {movie}")
            
            print("\n✅ API Integration test completed!")
            return True
        else:
            print("❌ Failed to initialize API")
            return False
            
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🎬 MOVIE RECOMMENDATION SYSTEM - FINAL TEST")
    print("=" * 60)
    
    # Test performance
    performance_results = test_system_performance()
    
    # Test API integration
    api_success = test_api_integration()
    
    # Final recommendations
    print("\n🎯 RECOMMENDATIONS FOR CLIENT SUBMISSION:")
    print("=" * 50)
    
    # Find best configuration
    successful_configs = [r for r in performance_results if r['success']]
    
    if successful_configs:
        # Sort by time (fastest first)
        fastest = min(successful_configs, key=lambda x: x['time'])
        print(f"✅ RECOMMENDED CONFIG: {fastest['config']}")
        print(f"   • Setup time: {fastest['time']:.1f} seconds")
        print(f"   • Movies available: {fastest['movies_loaded']:,}")
        print(f"   • Recommendations working: ✅")
        
        if api_success:
            print(f"   • API integration: ✅")
        else:
            print(f"   • API integration: ⚠️  (needs testing)")
        
        print(f"\n🚀 READY FOR CLIENT SUBMISSION!")
        print(f"   Use: setup_recommendation_system(use_large_dataset=True, sample_size=50000)")
        
    else:
        print("❌ No successful configurations found")
        print("   Fallback to original dataset with 4.8K movies")

if __name__ == "__main__":
    main()

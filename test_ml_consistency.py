#!/usr/bin/env python3
"""
Test script to validate ML consistency between notebook and backend
"""

import requests
import json

def test_backend_recommendations():
    """Test backend recommendations via API"""
    
    print("🧪 Testing Backend ML Recommendations...")
    print("="*50)
    
    # Test with Inception (should get sci-fi recommendations)
    test_movie = "Inception"
    
    try:
        response = requests.post(
            'http://localhost:5001/api/recommendations',
            json={'movie_titles': [test_movie]},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            recommendations = data.get('recommendations', [])
            
            print(f"✅ Backend API Response for '{test_movie}':")
            print(f"Total recommendations: {len(recommendations)}")
            print("\nTop 5 recommendations:")
            
            for i, rec in enumerate(recommendations[:5], 1):
                print(f"{i}. {rec}")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection Error: {e}")
        print("Make sure the backend is running on http://localhost:5001")

if __name__ == "__main__":
    test_backend_recommendations()
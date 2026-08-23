import sys
import os
import json

# Add backend directory to Python path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(backend_dir)

from app import create_app
from app.db import db, create_tables
from app.models.user import User
from app.models.rating import Rating

def run_tests():
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SECRET_KEY'] = 'test-secret'
    
    with app.test_client() as client:
        with app.app_context():
            create_tables(app)
            
            # Create a test user if it doesn't exist
            test_user = User.query.filter_by(email='test@example.com').first()
            if not test_user:
                test_user = User(
                    google_id='test_google_123',
                    email='test@example.com',
                    name='Test User'
                )
                db.session.add(test_user)
                
            test_user.set_password('password123')
            db.session.commit()
            
            print("🚀 Testing Unauthenticated Requests")
            # Try to get ratings without logging in
            resp = client.get('/api/ratings/')
            assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
            print("✅ Unauthenticated GET blocked (401)")
            
            # Log in the user via the auth endpoint
            login_resp = client.post('/api/auth/login', json={
                'email': 'test@example.com',
                'password': 'password123'
            })
            assert login_resp.status_code == 200, f"Login failed: {login_resp.data}"
                
            print("\n🚀 Testing Authenticated Requests")
            # 1. Create a valid rating
            resp = client.post('/api/ratings/', json={
                'imdb_id': 'tt1234567',
                'score': 4,
                'title': 'Test Movie',
                'media_type': 'movie'
            })
            assert resp.status_code == 201, f"Expected 201, got {resp.status_code} - {resp.data}"
            data = json.loads(resp.data)
            assert data['score'] == 4
            assert data['imdb_id'] == 'tt1234567'
            print("✅ Valid POST created rating successfully")
            
            # 2. Update existing rating (upsert)
            resp = client.post('/api/ratings/', json={
                'imdb_id': 'tt1234567',
                'score': 5,
                'title': 'Test Movie'
            })
            assert resp.status_code == 201, f"Expected 201, got {resp.status_code}"
            data = json.loads(resp.data)
            assert data['score'] == 5
            
            # Check db count to ensure it wasn't duplicated
            count = Rating.query.filter_by(user_id=test_user.id, imdb_id='tt1234567').count()
            assert count == 1, f"Expected 1 rating in DB, found {count}"
            print("✅ Duplicate POST successfully updated existing rating (upsert)")
            
            # 3. Invalid score (out of bounds)
            resp = client.post('/api/ratings/', json={
                'imdb_id': 'tt9876543',
                'score': 6
            })
            assert resp.status_code == 400, f"Expected 400, got {resp.status_code}"
            print("✅ Invalid score >5 correctly rejected (400)")
            
            resp = client.post('/api/ratings/', json={
                'imdb_id': 'tt9876543',
                'score': 0
            })
            assert resp.status_code == 400, f"Expected 400, got {resp.status_code}"
            print("✅ Invalid score <1 correctly rejected (400)")
            
            # 4. Fetch all user ratings
            resp = client.get('/api/ratings/')
            assert resp.status_code == 200
            data = json.loads(resp.data)
            assert len(data) == 1
            assert data[0]['imdb_id'] == 'tt1234567'
            assert data[0]['score'] == 5
            print("✅ GET successfully retrieved user's ratings")
            
            print("\n🎉 ALL TESTS PASSED!")

if __name__ == '__main__':
    run_tests()

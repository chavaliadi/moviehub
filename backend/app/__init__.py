from flask import Flask
import os
from flask_cors import CORS
from flask_restful import Api
from flask_login import LoginManager
from config.config import Config
from app.db import init_db, create_tables

# Initialize LoginManager
login_manager = LoginManager()


def create_app(config_class=Config):
    """Application factory pattern for Flask app"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Database
    init_db(app)

    # Initialize Flask-Login
    login_manager.init_app(app)

    # Configure User Loader
    from app.models import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    api = Api(app, prefix='/api')

    # Import and register blueprints (non-API informational routes)
    from app.routes import main_bp
    app.register_blueprint(main_bp)

    # Import and register API resources
    from app.api import movie_api, recommendation_api
    movie_api.init_app(api)
    recommendation_api.init_app(api)

    # Register Auth and Favorites Blueprints
    from app.api.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from app.api.favorites_routes import favorites_bp
    app.register_blueprint(favorites_bp, url_prefix='/api/favorites')

    # Auto-create tables in development when using SQLite
    db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '') or ''
    if db_uri.startswith('sqlite') and (app.config.get('DEBUG') or os.getenv('FLASK_ENV') == 'development'):
        # Ensure models are imported so tables are registered
        from app import models  # noqa: F401
        create_tables(app)

    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'MovieHub Backend is running!'}

    # Initialize ML system on startup in background thread if eager init is enabled
    if os.getenv('ML_EAGER_INIT', '0') == '1':
        import threading
        
        def init_ml_system():
            """Initialize ML system in background"""
            print("\n" + "="*60)
            print("🤖 Initializing ML Recommendation System (background)...")
            print("="*60)
            try:
                from app.services.recommendation_service import RecommendationService
                _ml_service = RecommendationService()
                # Trigger initialization
                _ml_service._initialize_system()
                print("="*60)
                print("✅ ML System Ready!")
                print("="*60 + "\n")
            except Exception as e:
                print("="*60)
                print(f"❌ ML System Initialization Failed: {e}")
                print("="*60 + "\n")
        
        # Start ML initialization in background thread
        ml_thread = threading.Thread(target=init_ml_system, daemon=True)
        ml_thread.start()
        print("🚀 ML system initializing in background...")
        print("📍 Server will be ready immediately, ML will be available in ~5-10 minutes\n")

    return app


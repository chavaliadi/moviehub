from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from flask_login import LoginManager
from config.config import Config
from app.db import init_db

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
    from app.models.user import User
    
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

    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'MovieHub Backend is running!'}

    return app

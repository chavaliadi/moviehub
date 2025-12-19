from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from config.config import Config


def create_app(config_class=Config):
    """Application factory pattern for Flask app"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    api = Api(app, prefix='/api')

    # Import and register blueprints (non-API informational routes)
    from app.routes import main_bp
    app.register_blueprint(main_bp)

    # Import and register API resources
    from app.api import movie_api, recommendation_api
    movie_api.init_app(api)
    recommendation_api.init_app(api)

    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'MovieHub Backend is running!'}

    return app

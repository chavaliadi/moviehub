#!/usr/bin/env python3
"""
MovieHub Backend - Main Entry Point
Run this file to start the Flask development server
"""

import os
from app import create_app
from config.config import config

# Get environment from environment variable
env = os.environ.get('FLASK_ENV', 'development')
# Default to 5001 to avoid macOS ControlCenter/AirPlay conflicts on 5000
port = int(os.environ.get('PORT', '5001'))

# Create Flask app with appropriate configuration
app = create_app(config[env])

if __name__ == '__main__':
    print(f"🚀 Starting MovieHub Backend in {env} mode...")
    print(f"📍 Server will be available at: http://localhost:{port}")
    print(f"🔍 Health check: http://localhost:{port}/health")
    print(f"📚 API endpoints: http://localhost:{port}/api/")
    print("=" * 50)

    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=port,
        debug=(env == 'development'),
        use_reloader=True
    )

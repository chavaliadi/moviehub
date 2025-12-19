# MovieHub Backend

A powerful Flask-based backend for the MovieHub application with built-in support for ML recommendation systems.

## 🚀 Features

- **Flask REST API** - Modern, scalable web framework
- **ML-Ready Architecture** - Prepared for recommendation algorithms
- **Database Integration** - SQLAlchemy ORM support
- **Caching System** - Redis integration for performance
- **Authentication Ready** - JWT-based auth system
- **API Documentation** - RESTful endpoints with proper error handling

## 📁 Project Structure

```
backend/
├── app/                    # Main application package
│   ├── __init__.py        # Flask app factory
│   ├── routes.py          # Route blueprints
│   ├── api/               # RESTful API resources
│   │   ├── __init__.py
│   │   ├── movie_api.py   # Movie-related endpoints
│   │   └── recommendation_api.py  # ML recommendation endpoints
│   └── services/          # Business logic layer
│       ├── movie_service.py       # Movie operations
│       └── recommendation_service.py  # ML operations
├── config/                # Configuration files
│   └── config.py          # App configuration classes
├── ml_engine/             # ML algorithms (to be implemented)
├── data/                  # Data files and datasets
├── models/                # Trained ML models
├── utils/                 # Utility functions
├── requirements.txt       # Python dependencies
├── run.py                 # Application entry point
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Run the Application

```bash
# Set environment
export FLASK_ENV=development

# Run the app
python run.py
```

The server will start at `http://localhost:5000`

## 🔌 API Endpoints

### Core Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /api/movies` - Get movies with pagination
- `GET /api/movies/search?q=<query>` - Search movies
- `GET /api/movies/<imdb_id>` - Get movie details
- `GET /api/movies/random?count=<number>` - Get random movies

### ML Endpoints

- `GET /api/ml/recommendations/similar?title=<movie title>&limit=<n>` - Similar movies by title (or use `movie_id` if numeric TMDB id)
- `GET /api/ml/recommendations/movie/<movie_title>?limit=<n>` - Similar movies (path param)
- `GET /api/ml/search?q=<query>&limit=<n>` - Fuzzy search titles
- `GET /api/ml/status` - Model status

## 🧠 ML Integration

The backend is designed to integrate seamlessly with machine learning systems:

### Current Status
- ✅ **Content-based recommender** using TF-IDF over full dataset (on-demand similarity)
- ✅ **REST API** endpoints wired to ML service
- 🔄 **Collaborative filtering** (user-based) planned for later

### Future ML Features
- **Collaborative Filtering** - User-based recommendations
- **Content-Based Filtering** - Movie similarity algorithms
- **Hybrid Recommendations** - Combined approach for better results
- **Model Training Pipeline** - Automated model updates
- **Performance Monitoring** - ML model metrics and evaluation

## 🗄️ Database Integration

### Current Setup
- **SQLite** - Default development database
- **SQLAlchemy** - ORM ready for production databases
- **PostgreSQL** - Production-ready configuration

### Future Features
- **User Management** - User accounts and preferences
- **Rating System** - Movie ratings and reviews
- **Watch History** - User viewing patterns
- **Social Features** - Friends and sharing

## 🚀 Deployment

### Development
```bash
python run.py
```

### Production
```bash
# Using Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app

# Using Docker (coming soon)
docker-compose up
```

## 🔧 Configuration

The application supports multiple environments:

- **Development** - Debug mode, SQLite database
- **Production** - Production settings, PostgreSQL
- **Testing** - Test database, debugging disabled

## 📚 Next Steps

1. **Implement ML Algorithms** - Add recommendation engines
2. **Database Models** - Create user and movie data models
3. **Authentication** - Implement JWT-based user auth
4. **Caching** - Add Redis for performance
5. **Testing** - Add comprehensive test suite
6. **Documentation** - API documentation with Swagger

## 🤝 Contributing

This backend is designed to be easily extensible. Key areas for contribution:

- ML algorithm implementation
- Database schema design
- API endpoint enhancements
- Performance optimization
- Testing and documentation

## 📄 License

This project is part of the MovieHub application.

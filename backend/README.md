# MovieHub Backend 🚀

The core API for MovieHub, built with Flask and powered by an advanced ML recommendation engine.

## ✨ Core Features

- **Tiered ML Engine** - Immediate 100K movie quick-start, auto-scaling to 1.3M in the background.
- **Session Auth** - Secure user management using Flask-Login.
- **Singleton Service** - Optimized memory usage and thread-safe ML model access.
- **RESTful API** - Clean endpoints for movies, favorites, and recommendations.
- **Production Ready** - Configured with Gunicorn and Docker support.

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/               # API Blueprints (Movies, Recommendations, Auth)
│   ├── models/            # SQLAlchemy Database Models
│   ├── services/          # RecommendationService (Singleton)
│   └── __init__.py        # App Factory & Background Tasks
├── ml_engine/             # TF-IDF & Cosine Similarity Implementation
├── data/                  # TMDB Datasets (tmbd.csv)
├── instance/              # Local SQLite database
├── Dockerfile             # Container configuration
└── run.py                 # Development entry point
```

## 🛠️ Getting Started

### 1. Setup Environment
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

### 2. Configure
```bash
cp .env.example .env
# Ensure ML_EAGER_INIT=1 for startup loading
```

### 3. Run
```bash
python run.py
```
Server starts at `http://localhost:5001`.

## 🔌 Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ml/status` | GET | Check model loading phase & movie count |
| `/api/ml/recommendations/similar` | GET | Get AI-based movie recommendations |
| `/api/auth/login` | POST | Authenticate user |
| `/api/favorites/` | GET | Retrieve user's saved movies |

## 🧠 ML System Details

The backend implements a **content-based filtering** algorithm using:
- **Vectorization**: TF-IDF with custom feature weighting.
- **Similarity**: Cosine similarity via sparse CSR matrices.
- **Strategy**: Tiered loading to balance startup speed with dataset depth.

---
*Part of the MovieHub Project*

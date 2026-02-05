# 🎬 MovieHub - AI-Powered Movie Recommendation System

A full-stack web application that provides personalized movie recommendations using machine learning. Built with Flask (Python) backend and React frontend, featuring a content-based recommendation system powered by TF-IDF vectorization and cosine similarity.

![MovieHub](https://img.shields.io/badge/MovieHub-AI%20Recommendations-blue)
![Python](https://img.shields.io/badge/Python-3.11+-green)
![React](https://img.shields.io/badge/React-19-blue)
![Flask](https://img.shields.io/badge/Flask-2.3-lightgrey)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start (Docker)](#🚀-quick-start-docker-recommended)
- [ML Engine & Tiered Loading](#🧠-ml-engine--tiered-loading)
- [API Documentation](#-api-documentation)
- [ML Engine Details](#-ml-engine-details)
- [Contributing](#-contributing)

## ✨ Features

### Core Functionality
- 🎯 **AI-Powered Recommendations**: Content-based filtering using TF-IDF vectorization.
- 🚀 **Tiered ML Loading**: Quick-start with 100K movies, auto-upgrades to 1.3M in the background.
- 🔍 **Movie Search**: Search through 1.3M+ movies from TMDB dataset.
- ❤️ **Favorites Management**: Save and organize your favorite movies.
- 👤 **User Authentication**: Secure login/registration system.
- 🎨 **Modern UI**: Netflix-inspired interface with glassmorphism design.

### ML Features
- **Full Dataset Support**: Trained on 1.3M movies from TMDB.
- **Optimized Performance**: Sparse matrix operations for fast recommendations.
- **Genre-Aware Scoring**: Enhanced recommendations based on genre overlap.
- **Real-time Inference**: Fast API responses with Singleton service pattern.

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask 2.3.3
- **ML Library**: scikit-learn (TF-IDF, Cosine Similarity)
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Authentication**: Flask-Login
- **Server**: Gunicorn (for Docker/Production)

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Styling**: Vanilla CSS with Glassmorphism

## 📁 Project Structure

```
MovieHub/
├── backend/
│   ├── app/
│   │   ├── api/              # REST API endpoints
│   │   ├── models/           # Database models
│   │   ├── services/         # Business logic (Recommendation Singleton)
│   │   └── __init__.py
│   ├── ml_engine/            # Optimized ML core
│   ├── data/                 # TMDB Dataset (1.3M movies)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # UI Components
│   │   ├── pages/            # Page Views
│   │   └── css/              # Design System
│   └── Dockerfile
└── docker-compose.yml        # Orchestration
```

## 🚀 Quick Start (Docker) [RECOMMENDED]

Run the entire stack with a single command:

1. **Clone the Repo**
2. **Launch**:
   ```bash
   docker-compose up --build
   ```
3. **Enjoy**: 
   - Frontend: `http://localhost`
   - API Status: `http://localhost:5001/api/ml/status`

## 🧠 ML Engine & Tiered Loading

To ensure the application is ready immediately while still supporting a massive dataset, MovieHub uses a **Tiered Loading Strategy**:

1. **Phase 1: Quick Start (30s)**: Loads the **100,000 most popular movies**. Recommendations are available almost instantly.
2. **Phase 2: Background Load (5-10m)**: Loads the full **1.3 million movies** dataset in a background thread. The system automatically swaps the model once training is complete without any downtime.

You can monitor progress via the status banner in the **"For You"** section.

## � API Documentation

### ML Recommendations
- `GET /api/ml/recommendations/similar?title=<movie>` - Get similar movies
- `GET /api/ml/status` - Detailed loading status and movie count

### Authentication
- `POST /api/auth/register` - New user signup
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current session details

### Favorites
- `GET /api/favorites/` - Get user's favorites
- `POST /api/favorites/` - Add to favorites
- `DELETE /api/favorites/<imdb_id>` - Remove from favorites

## 🧠 ML Engine Details

### Feature Engineering
The engine extracts and weights the following features:
- **Genres** (High Weight)
- **Keywords** (Medium Weight)
- **Overview & Tagline**
- **Language & Production Countries**

### Performance Optimizations
- **Sparse CSR Matrices**: Minimizes memory footprint for 1.3M records.
- **Argpartition**: Efficiently finds top-K similarities without full sorting.
- **Singleton Service**: Ensures only one instance of the ML model exists in memory across all API requests.

---

**Built with ❤️ by Adithya Chavali**

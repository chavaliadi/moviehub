# MovieHub Frontend 🎨

A modern, cinematic React interface for the MovieHub recommendation system.

## ✨ Features

- **Cinematic UI** - Netflix-inspired design with Glassmorphism and smooth transitions.
- **Live ML Status** - Real-time tracking of the backend ML engine's loading phases.
- **Universal Search** - Fast movie searching across the TMDB universe.
- **Favorites Management** - Interactive "Like" system with instant feedback.
- **Personalized Feed** - Dynamic recommendations that update as the ML engine scales.

## 🛠️ Tech Stack

- **Framework**: React 19 (Vite)
- **State**: React Context API
- **Routing**: React Router DOM 7
- **Style**: Custom CSS Variables & Design Tokens
- **Icons**: Lucide React
- **Toast**: React Toastify

## 🚀 Getting Started

### 1. Install
```bash
npm install
```

### 2. Run
```bash
npm run dev
```
App will be available at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

## 📁 Key Components

- `NavBar.jsx`: Glassmorphic navigation with auth status.
- `MovieCard.jsx`: Interactive card with hover effects and favorite toggling.
- `Recommendations.jsx`: The AI-driven discovery engine view.
- `Profile.jsx`: User stats and account overview.

## 🌈 Design System

The frontend uses a custom CSS architecture defined in `src/css/index.css`:
- **Glassmorphism**: `.glass-panel` utility for consistent frosted-glass effects.
- **Animations**: Global `.animate-fade-in` and spring-based transitions.
- **Theme**: High-contrast cinematic dark mode by default.

---
*Part of the MovieHub Project*

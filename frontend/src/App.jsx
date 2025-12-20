import { MovieProvider } from "./contexts/MovieContext";
import { AuthProvider } from "./context/AuthContext";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Favourites from "./pages/Favourites"; // Keeping existing Favourites page too if needed or replacing
// But wait, I created src/pages/Favorites.jsx (US English)
// The original was src/pages/Favourites.jsx (UK English)
// I should use my new one if I want the new logic
import Favorites from "./pages/Favorites";
import Login from "./components/Login";
import Recommendations from "./pages/Recommendations";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NavBar from "./components/NavBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthProvider>
      <MovieProvider>
        <NavBar />
        <ToastContainer
          position="top-center"
          autoClose={2000}
          theme="dark"
          toastStyle={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: 'var(--text-primary)'
          }}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            {/* Keeping old route for backward compatibility if needed, but pointing to new component */}
            <Route path="/favourites" element={<Favorites />} />
          </Routes>
        </main>
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;
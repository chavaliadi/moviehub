import { MovieProvider } from "./contexts/MovieContext";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Favourites from "./pages/Favourites";
import Recommendations from "./pages/Recommendations";
import NavBar from "./components/NavBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
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
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </main>
    </MovieProvider>
  );
}

export default App;
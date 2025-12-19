import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Sparkles, Clapperboard } from "lucide-react"; // Import icons
import "../css/NavBar.css"

function NavBar() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;
    
    return(
        <nav className="navbar">
            <div className="navbar-container container">
                <div className="navbar-brand">
                    <Link to="/" className="moviehub-logo">
                        <Clapperboard className="logo-icon" size={28} />
                        <span className="logo-text">Movie<span className="logo-accent">Hub</span></span>
                    </Link>
                </div>
                <div className="navbar-links">
                    <Link 
                        to="/" 
                        className={`nav-link ${isActive("/") ? "active" : ""}`}
                    >
                        <Home size={20} />
                        <span>Home</span>
                    </Link>
                    <Link 
                        to="/favourites" 
                        className={`nav-link ${isActive("/favourites") ? "active" : ""}`}
                    >
                        <Heart size={20} />
                        <span>Favourites</span>
                    </Link>
                    <Link 
                        to="/recommendations" 
                        className={`nav-link ${isActive("/recommendations") ? "active" : ""}`}
                    >
                        <Sparkles size={20} />
                        <span>For You</span>
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default NavBar
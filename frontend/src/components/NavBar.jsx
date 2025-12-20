import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Sparkles, Clapperboard, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../css/NavBar.css"

function NavBar() {
    const location = useLocation();
    const { user, logout } = useAuth();

    // Check for both spelling variants
    const isFavoritesActive = location.pathname === "/favorites" || location.pathname === "/favourites";

    const isActive = (path) => location.pathname === path;

    return (
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
                        to="/favorites"
                        className={`nav-link ${isFavoritesActive ? "active" : ""}`}
                    >
                        <Heart size={20} />
                        <span>Favorites</span>
                    </Link>
                    <Link
                        to="/recommendations"
                        className={`nav-link ${isActive("/recommendations") ? "active" : ""}`}
                    >
                        <Sparkles size={20} />
                        <span>For You</span>
                    </Link>

                    {user ? (
                        <div className="nav-auth-section">
                            <Link to="/profile" className="user-profile" title="View Profile">
                                {user.profile_picture ? (
                                    <img
                                        src={user.profile_picture}
                                        alt={user.name}
                                        className="user-avatar"
                                    />
                                ) : (
                                    <User size={20} />
                                )}
                            </Link>
                            <button onClick={logout} className="auth-btn" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className={`nav-link ${isActive("/login") ? "active" : ""}`}
                        >
                            <LogIn size={20} />
                            <span>Login</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default NavBar
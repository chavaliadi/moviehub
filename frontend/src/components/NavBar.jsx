import { Link, useLocation } from "react-router-dom";
import "../css/NavBar.css"

function NavBar() {
    const location = useLocation();
    
    return(
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="moviehub-logo">
                    <span className="logo-accent">M</span>ovie<span className="logo-accent">H</span>ub
                </Link>
            </div>
            <div className="navbar-links">
                <Link 
                    to="/" 
                    className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
                >
                    Home
                </Link>
                <Link 
                    to="/favourites" 
                    className={`nav-link ${location.pathname === "/favourites" ? "active" : ""}`}
                >
                    Favourites
                </Link>
                <Link 
                    to="/recommendations" 
                    className={`nav-link ${location.pathname === "/recommendations" ? "active" : ""}`}
                >
                    Recommendations
                </Link>
            </div>
        </nav>
    )
}

export default NavBar
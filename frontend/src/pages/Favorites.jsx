import "../css/Favorites.css";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Favorites() {
    const { favourites } = useMovieContext();
    const { user } = useAuth();

    if (favourites.length === 0) {
        return (
            <div className="favorites-empty">
                <h2>No Favorite Movies Yet</h2>
                <p>Start adding movies to your favorites and they will appear here</p>
            </div>
        );
    }

    return (
        <div className="favorites">
            <div className="favorites-header">
                <h2>Your Favorites</h2>
                {!user && <p className="auth-hint"><Link to="/login">Login</Link> to save your favorites permanently</p>}
            </div>
            <div className="movies-grid">
                {favourites.map((movie) => (
                    <MovieCard
                        movie={{
                            ...movie,
                            // Adapt API response to MovieCard expected format if needed
                            imdbID: movie.imdb_id || movie.imdbID,
                            Title: movie.movie_title || movie.Title,
                            Poster: movie.movie_poster || movie.Poster,
                            Year: movie.movie_year || movie.Year,
                            Type: movie.movie_type || movie.Type
                        }}
                        key={movie.imdb_id || movie.imdbID}
                    />
                ))}
            </div>
        </div>
    );
}

export default Favorites;

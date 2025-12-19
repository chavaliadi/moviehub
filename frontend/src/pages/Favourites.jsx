import "../css/Favourites.css"
import { useMovieContext } from "../contexts/MovieContext"
import MovieCard from "../components/MovieCard"
import { Heart } from "lucide-react";

function Favourites() {
    const { favourites } = useMovieContext();

    return (
        <div className="favourites container">
            <div className="favourites-header">
                <h1 className="page-title">
                    Your <span className="text-gradient-primary">Collection</span>
                </h1>
                <p className="page-subtitle">
                    {favourites.length} {favourites.length === 1 ? 'movie' : 'movies'} saved to your library
                </p>
            </div>

            <div className="movies-grid">
                {favourites && favourites.length > 0 ? (
                    favourites.map((movie) => (
                        <MovieCard key={movie.imdbID} movie={movie} />
                    ))
                ) : (
                    <div className="empty-state glass-panel">
                        <Heart size={48} className="empty-icon" />
                        <h2>No favourites yet</h2>
                        <p>Start collecting movies you love!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Favourites;

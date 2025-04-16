import { useMovieContext } from "../contexts/MovieContext";

function MovieCard({ movie }) {
    const { isFavourite, addToFavourites, removeFromFavourites } = useMovieContext();
    const favourites = isFavourite(movie.id);

    // Handle click event to add or remove from favourites
    function onFavClick(e) {
        e.preventDefault();
        if (favourites) {
            removeFromFavourites(movie.id);
        } else {
            addToFavourites(movie);
        }
    }

    return (
        <div className="movie-card">
            <div className="movie-poster">
                <img
                    src={movie.Poster === "N/A" ? "https://via.placeholder.com/150" : movie.Poster}
                    alt={movie.Title}
                />
                <div className="movie-overlay">
                    <button className={`fav-btn ${favourites ? "active" : ""}`} onClick={onFavClick}>
                        💚
                    </button>
                </div>
            </div>
            <div className="movie-info">
                <h3>{movie.Title}</h3>
                <p>{movie.Year}</p>
            </div>
        </div>
    );
}

export default MovieCard;

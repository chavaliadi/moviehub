import { useState } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { toast } from "react-toastify";

function MovieCard({ movie }) {
    const { isFavourite, addToFavourites, removeFromFavourites } = useMovieContext();
    const [showModal, setShowModal] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [modalImageError, setModalImageError] = useState(false);
    const favourites = isFavourite(movie.imdbID);

    // Ratings and stars removed per spec

    // Handle click event to add or remove from favourites
    function onFavClick(e) {
        e.preventDefault();
        e.stopPropagation();
        if (favourites) {
            removeFromFavourites(movie.imdbID);
            toast.success(`"${movie.Title}" removed from favorites!`, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } else {
            addToFavourites(movie);
            toast.success(`"${movie.Title}" added to favorites!`, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    }

    // Handle card click to show modal
    function onCardClick() {
        setShowModal(true);
        setModalImageError(false); // Reset modal image error when opening
    }

    const normalizePosterUrl = (url) => {
        if (!url || url === "N/A") return null;
        // Check if it's just a filename without domain (common OMDB issue)
        if (!url.includes('.') || url.match(/^[A-Z0-9_]+\.jpg$/i)) {
            return null;
        }
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        if (url.startsWith("//")) return `https:${url}`;
        // If it's just a filename or unexpected format, treat as missing to avoid 404s
        return null;
    };

    const posterSrc = normalizePosterUrl(movie.Poster);
    const showPoster = posterSrc && !imageError;
    const showModalPoster = posterSrc && !modalImageError;

    return (
        <>
            <div className="movie-card" onClick={onCardClick}>
                <div className="movie-poster">
                    {showPoster ? (
                        <img
                            src={posterSrc}
                            alt={movie.Title}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                setImageError(true);
                            }}
                            loading="lazy"
                        />
                    ) : (
                        <div className="no-poster">
                            <div className="no-poster-icon">🎬</div>
                            <div className="no-poster-text">
                                {movie.Title || "No Image Available"}
                            </div>
                        </div>
                    )}
                    <div className="movie-overlay">
                        <button className={`fav-btn ${favourites ? "active" : ""}`} onClick={onFavClick}>
                            {favourites ? "❤️" : "🤍"}
                        </button>
                    </div>
                    
                </div>
                <div className="movie-info">
                    <h3 className="movie-title">{movie.Title}</h3>
                    <p className="movie-year">{movie.Year}</p>
                    
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowModal(false)}>
                            ✕
                        </button>
                        <div className="modal-header">
                            {showModalPoster ? (
                                <img
                                    src={posterSrc}
                                    alt={movie.Title}
                                    className="modal-poster"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        setModalImageError(true);
                                    }}
                                />
                            ) : (
                                <div className="modal-no-poster">
                                    <div className="modal-no-poster-icon">🎬</div>
                                    <div className="modal-no-poster-text">No Image Available</div>
                                </div>
                            )}
                            <div className="modal-info">
                                <h2>{movie.Title}</h2>
                                <p className="modal-year">{movie.Year}</p>
                                {movie.Type && (
                                    <p className="modal-type" style={{ 
                                        display: 'inline-block',
                                        padding: '0.4rem 1rem',
                                        background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        marginTop: '0.5rem',
                                        textTransform: 'capitalize'
                                    }}>
                                        {movie.Type}
                                    </p>
                                )}
                                {favourites && (
                                    <div className="fav-ribbon">In your favourites ✨</div>
                                )}
                                <div className="modal-actions">
                                    <button className={`modal-fav-btn ${favourites ? "active" : ""}`} onClick={onFavClick}>
                                        {favourites ? "❤️ Remove from Favorites" : "🤍 Add to Favorites"}
                                    </button>
                                    {movie.imdbID && (
                                        <a 
                                            href={`https://www.imdb.com/title/${movie.imdbID}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="modal-watch-btn"
                                            style={{ textDecoration: 'none' }}
                                        >
                                            📺 View on IMDb
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-body">
                            <p className="modal-description">
                                {movie.Plot || "Plot description not available."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default MovieCard;

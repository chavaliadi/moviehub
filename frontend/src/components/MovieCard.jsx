import { useState } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { toast } from "react-toastify";
import { Heart, Info, X, ExternalLink, Calendar, Film } from "lucide-react";
import "../css/MovieCard.css";

function MovieCard({ movie }) {
    const { isFavourite, addToFavourites, removeFromFavourites } = useMovieContext();
    const [showModal, setShowModal] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [modalImageError, setModalImageError] = useState(false);

    // Safety check for movie object
    if (!movie) return null;

    const favourites = isFavourite(movie.imdbID);

    function onFavClick(e) {
        e.preventDefault();
        e.stopPropagation();
        if (favourites) {
            removeFromFavourites(movie.imdbID);
            toast.info(`Removed from favorites`, {
                icon: "💔"
            });
        } else {
            addToFavourites(movie);
            toast.success(`Added to favorites!`, {
                icon: "❤️"
            });
        }
    }

    function onCardClick() {
        setShowModal(true);
        setModalImageError(false);
    }

    const normalizePosterUrl = (url) => {
        if (!url || url === "N/A") return null;
        if (!url.includes('.') || url.match(/^[A-Z0-9_]+\.jpg$/i)) return null;
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        if (url.startsWith("//")) return `https:${url}`;
        return null;
    };

    const posterSrc = normalizePosterUrl(movie.Poster);
    const showPoster = posterSrc && !imageError;
    const showModalPoster = posterSrc && !modalImageError;

    return (
        <>
            <div className="movie-card" onClick={onCardClick}>
                <div className="movie-poster-wrapper">
                    {showPoster ? (
                        <img
                            src={posterSrc}
                            alt={movie.Title}
                            className="movie-poster-img"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                setImageError(true);
                            }}
                            loading="lazy"
                        />
                    ) : (
                        <div className="no-poster">
                            <Film size={48} className="no-poster-icon" />
                            <span className="no-poster-text">{movie.Title}</span>
                        </div>
                    )}
                    <div className="movie-overlay">
                        <button
                            className={`action-btn fav-btn ${favourites ? "active" : ""}`}
                            onClick={onFavClick}
                            title={favourites ? "Remove from Favorites" : "Add to Favorites"}
                        >
                            <Heart size={20} fill={favourites ? "currentColor" : "none"} />
                        </button>
                        <div className="overlay-info">
                            <span className="overlay-year">{movie.Year}</span>
                            <Info size={20} />
                        </div>
                    </div>
                </div>
                <div className="movie-info">
                    <h3 className="movie-title">{movie.Title}</h3>
                    <div className="movie-meta">
                        <span className="movie-year">{movie.Year}</span>
                        <span className="movie-type">{movie.Type}</span>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                            <X size={24} />
                        </button>

                        <div className="modal-grid">
                            <div className="modal-poster-section">
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
                                        <Film size={64} />
                                    </div>
                                )}
                            </div>

                            <div className="modal-details">
                                <h2 className="modal-title">{movie.Title}</h2>

                                <div className="modal-meta-row">
                                    <div className="meta-badge">
                                        <Calendar size={14} />
                                        {movie.Year}
                                    </div>
                                    <div className="meta-badge type-badge">
                                        {movie.Type}
                                    </div>
                                </div>

                                <p className="modal-plot">
                                    {movie.Plot || "Plot description not available."}
                                </p>

                                <div className="modal-actions">
                                    <button
                                        className={`btn-primary ${favourites ? "btn-danger" : ""}`}
                                        onClick={onFavClick}
                                    >
                                        <Heart size={18} fill={favourites ? "currentColor" : "none"} />
                                        {favourites ? "Remove from Favorites" : "Add to Favorites"}
                                    </button>

                                    {movie.imdbID && (
                                        <a
                                            href={`https://www.imdb.com/title/${movie.imdbID}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary"
                                        >
                                            <ExternalLink size={18} />
                                            View on IMDb
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default MovieCard;

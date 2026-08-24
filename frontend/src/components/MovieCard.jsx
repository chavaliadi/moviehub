import { useState } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Heart, Info, X, ExternalLink, Calendar, Film, Star, Bookmark } from "lucide-react";
import "../css/MovieCard.css";

function MovieCard({ movie }) {
    const { isFavourite, addToFavourites, removeFromFavourites, ratings, rateMovie, isInWatchlist, addToWatchlist, removeFromWatchlist } = useMovieContext();
    const { user } = useAuth();
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

    const inWatchlist = isInWatchlist(movie.imdbID);

    async function onWatchlistClick(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.info("Please log in to manage your watchlist");
            return;
        }
        if (inWatchlist) {
            const success = await removeFromWatchlist(movie.imdbID);
            if (success) {
                toast.info(`Removed from watchlist`, { icon: "🔖" });
            }
        } else {
            const success = await addToWatchlist(movie);
            if (success) {
                toast.success(`Added to watchlist!`, { icon: "🔖" });
            }
        }
    }

    const currentRating = ratings[movie.imdbID] || 0;

    function onRateClick(score) {
        if (!user) {
            toast.info("Please log in to rate movies");
            return;
        }
        rateMovie(movie, score);
        toast.success(`Rated ${score} stars!`, { icon: "⭐" });
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
        if (url.startsWith("/")) return `https://image.tmdb.org/t/p/w500${url}`;
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

                                    <button
                                        className={`btn-primary ${inWatchlist ? "btn-danger" : ""}`}
                                        onClick={onWatchlistClick}
                                    >
                                        <Bookmark size={18} fill={inWatchlist ? "currentColor" : "none"} />
                                        {inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
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
                                
                                <div className="movie-rating-stars" style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.9em', opacity: 0.8, marginRight: '8px' }}>Your Rating:</span>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button 
                                            key={star}
                                            onClick={() => onRateClick(star)}
                                            style={{ 
                                                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                                color: star <= currentRating ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                                                transition: 'transform 0.1s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            title={`Rate ${star} stars`}
                                        >
                                            <Star size={24} fill={star <= currentRating ? '#fbbf24' : 'none'} />
                                        </button>
                                    ))}
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

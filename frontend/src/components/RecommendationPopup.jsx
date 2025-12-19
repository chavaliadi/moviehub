import { useState, useEffect } from "react";
import "../css/RecommendationPopup.css";

function RecommendationPopup({ selectedCount, onGetRecommendations, onClose, favoriteMovies }) {
    const [animationPhase, setAnimationPhase] = useState('entering');

    useEffect(() => {
        const timer = setTimeout(() => setAnimationPhase('visible'), 100);
        return () => clearTimeout(timer);
    }, []);

    const getPopupContent = () => {
        switch (selectedCount) {
            case 1:
                return {
                    title: "🎬 One Great Choice!",
                    subtitle: "Ready to discover movies that match your taste?",
                    description: `Based on "${favoriteMovies[0]?.Title}", we'll find similar gems you'll love!`,
                    primaryAction: "🚀 Discover Similar Movies",
                    secondaryAction: "🔄 Choose Different Movie"
                };
            case 2:
                return {
                    title: "🎭 Perfect Pair!",
                    subtitle: "Two favorites = Double the fun!",
                    description: "We'll blend your tastes and find movies that combine the best of both worlds!",
                    primaryAction: "✨ Create Magic Mix",
                    secondaryAction: "🎲 Add More Movies"
                };
            case 3:
                return {
                    title: "🌟 Triple Threat!",
                    subtitle: "You've got excellent taste!",
                    description: "Three favorites give us the perfect recipe for amazing recommendations!",
                    primaryAction: "🎯 Hit Me With Gold",
                    secondaryAction: "🔍 Fine-tune Selection"
                };
            default:
                return {
                    title: `🎊 ${selectedCount} Favorites!`,
                    subtitle: "You're a true movie connoisseur!",
                    description: "With this many favorites, we can create a personalized cinema experience just for you!",
                    primaryAction: "🎪 Build My Cinema",
                    secondaryAction: "📝 Adjust My List"
                };
        }
    };

    const content = getPopupContent();

    const handleClose = () => {
        setAnimationPhase('leaving');
        setTimeout(onClose, 300);
    };

    const handleGetRecommendations = () => {
        setAnimationPhase('leaving');
        setTimeout(onGetRecommendations, 200);
    };

    return (
        <div className={`popup-overlay ${animationPhase}`}>
            <div className={`recommendation-popup ${animationPhase}`}>
                <div className="popup-header">
                    <div className="popup-title">{content.title}</div>
                    <button className="close-btn" onClick={handleClose}>✕</button>
                </div>

                <div className="popup-content">
                    <div className="popup-subtitle">{content.subtitle}</div>
                    <div className="popup-description">{content.description}</div>

                    {favoriteMovies.length > 0 && (
                        <div className="selected-movies">
                            {favoriteMovies.slice(0, 3).map((movie, index) => (
                                <div key={movie.imdbID} className="mini-movie-card">
                                    {movie.Poster && movie.Poster !== "N/A" ? (
                                        <img
                                            src={movie.Poster}
                                            alt={movie.Title}
                                            className="mini-poster"
                                        />
                                    ) : (
                                        <div className="mini-poster mini-no-image">No Image</div>
                                    )}
                                    <span className="mini-title">{movie.Title}</span>
                                </div>
                            ))}
                            {favoriteMovies.length > 3 && (
                                <div className="more-movies">+{favoriteMovies.length - 3} more</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="popup-actions">
                    <button
                        className="primary-action-btn"
                        onClick={handleGetRecommendations}
                    >
                        {content.primaryAction}
                    </button>
                    <button
                        className="secondary-action-btn"
                        onClick={handleClose}
                    >
                        {content.secondaryAction}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RecommendationPopup;
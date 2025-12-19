import { useEffect, useState } from "react";
import { getSimilarByTitle, getMovieByTitle } from "../services/api";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import RecommendationPopup from "../components/RecommendationPopup";
import "../css/Recommendations.css";

function Recommendations() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {
        favourites,
        selectedForRecommendations,
        setSelectedForRecommendations,
        recommendationsCache,
        setRecommendationsCache,
        showRecommendationPopup,
        setShowRecommendationPopup
    } = useMovieContext();
    const [refreshKey, setRefreshKey] = useState(0);

    // Group movies by genre
    const groupMoviesByGenre = (movieList) => {
        const groups = {};
        movieList.forEach(movie => {
            if (movie.Genre) {
                const genres = movie.Genre.split(', ');
                genres.forEach(genre => {
                    if (!groups[genre]) {
                        groups[genre] = [];
                    }
                    if (!groups[genre].find(m => m.imdbID === movie.imdbID)) {
                        groups[genre].push(movie);
                    }
                });
            }
        });
        return groups;
    };

    // Handle favorite selection with clear popup logic
    const handleFavoriteSelection = (selectedIds) => {
        const previousCount = selectedForRecommendations.length;
        setSelectedForRecommendations(selectedIds);

        // Show popup when moving from 0 -> >=1 selections
        if (previousCount === 0 && selectedIds.length > 0) {
            setShowRecommendationPopup(true);
        }
        // If popup is already open and selection changes, keep it open (content updates via props)
    };

    // Get recommendations without popup (for refresh button)
    const getRecommendationsDirectly = () => {
        if (selectedForRecommendations.length > 0) {
            setRefreshKey(k => k + 1);
        }
    };

    // Get recommendations and close popup
    const handleGetRecommendations = () => {
        setShowRecommendationPopup(false);
        if (selectedForRecommendations.length > 0) {
            fetchRecommendations(selectedForRecommendations);
        }
    };

    // Fetch recommendations function - OPTIMIZED with parallel fetching
    const fetchRecommendations = async (selectedIds) => {
        if (!selectedIds.length) {
            setError("Select at least one favourite to get recommendations.");
            setRecommendationsCache([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Get all favorite titles first
            const favoriteTitles = selectedIds
                .map(id => favourites.find(f => f.imdbID === id)?.Title)
                .filter(Boolean);
            
            if (favoriteTitles.length === 0) {
                setError("No valid favorites selected.");
                setLoading(false);
                return;
            }

            // Fetch ALL recommendations in parallel (much faster!)
            const recommendationPromises = favoriteTitles.map(title => 
                getSimilarByTitle(title, 8).catch(err => {
                    console.warn(`Recommendation error for ${title}:`, err);
                    return { success: false, similar_movies: [] };
                })
            );

            const recommendationResults = await Promise.all(recommendationPromises);
            
            // Collect all unique recommendations
            const allTitles = new Set();
            const allRecs = [];
            
            recommendationResults.forEach(data => {
                if (data?.success && Array.isArray(data.similar_movies)) {
                    data.similar_movies.forEach(rec => {
                        if (!allTitles.has(rec.title)) {
                            allTitles.add(rec.title);
                            allRecs.push(rec.title);
                        }
                    });
                }
            });

            // Limit to top 30 recommendations for performance
            const limitedRecs = allRecs.slice(0, 30);

            // Fetch movie details in parallel (batched for better performance)
            const batchSize = 10;
            const allDetails = [];
            
            for (let i = 0; i < limitedRecs.length; i += batchSize) {
                const batch = limitedRecs.slice(i, i + batchSize);
                const batchPromises = batch.map(title => 
                    getMovieByTitle(title).catch(() => null)
                );
                const batchResults = await Promise.all(batchPromises);
                allDetails.push(...batchResults.filter(Boolean));
            }

            setRecommendationsCache(allDetails);
        } catch (e) {
            console.error("Recommendations error:", e);
            setError("We couldn't fetch recommendations right now. Please try again or adjust your favourites.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only auto-fetch if we have selected favorites and no cached recommendations
        if (selectedForRecommendations.length > 0 && recommendationsCache.length === 0) {
            fetchRecommendations(selectedForRecommendations);
        }
    }, [selectedForRecommendations]);

    useEffect(() => {
        // Handle refresh key changes
        if (refreshKey > 0 && selectedForRecommendations.length > 0) {
            fetchRecommendations(selectedForRecommendations);
        }
    }, [refreshKey]);

    const moviesByGenre = groupMoviesByGenre(recommendationsCache);
    const selectedFavoriteMovies = favourites.filter(fav => selectedForRecommendations.includes(fav.imdbID));

    return (
        <div className="recommendations">
            {showRecommendationPopup && (
                <RecommendationPopup
                    selectedCount={selectedForRecommendations.length}
                    favoriteMovies={selectedFavoriteMovies}
                    onGetRecommendations={handleGetRecommendations}
                    onClose={() => setShowRecommendationPopup(false)}
                />
            )}

            <div className="recommendations-header">
                <h1 className="recommendations-title">Your Recommendations</h1>
                <p className="recommendations-subtitle">
                    Get personalized movie picks based on your favorites. Select multiple movies for more diverse recommendations!
                </p>

                {favourites.length > 0 ? (
                    <div className="favorites-selector">
                        <h3>Choose favorites for recommendations:</h3>
                        <select
                            className="favorites-select"
                            multiple
                            value={selectedForRecommendations}
                            onChange={e => {
                                const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                                handleFavoriteSelection(opts);
                            }}
                        >
                            {favourites.map(fav => (
                                <option key={fav.imdbID} value={fav.imdbID}>{fav.Title}</option>
                            ))}
                        </select>
                        <button
                            className="refresh-button"
                            onClick={getRecommendationsDirectly}
                            disabled={selectedForRecommendations.length === 0}
                        >
                            🔄 Refresh Recommendations
                        </button>
                    </div>
                ) : (
                    <div className="recommendations-empty">
                        <div className="recommendations-empty-icon">⭐</div>
                        <div className="recommendations-empty-text">
                            Add some movies to your favourites to get recommendations!
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="loading-spinner"></div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : recommendationsCache.length === 0 && selectedForRecommendations.length > 0 ? (
                <div className="error-message">
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                    <div>No recommendations found. Try selecting different favourites!</div>
                </div>
            ) : recommendationsCache.length === 0 ? (
                <div className="recommendations-empty">
                    <div className="recommendations-empty-icon">🎬</div>
                    <div className="recommendations-empty-text">
                        {favourites.length === 0 
                            ? "Add some movies to your favourites to get personalized recommendations!"
                            : "Select your favourite movies above to discover amazing recommendations!"}
                    </div>
                </div>
            ) : (
                Object.entries(moviesByGenre).map(([genre, genreMovies]) => (
                    <div key={genre} className="movies-row">
                        <h2 className="movies-row-title">{genre}</h2>
                        <div className="movies-row-content">
                            {genreMovies.map((movie) => (
                                <MovieCard key={movie.imdbID} movie={movie} />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default Recommendations;
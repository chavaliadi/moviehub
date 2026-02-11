import { useEffect, useState } from "react";
import { getSimilarByTitle, getMovieByTitle, getMLStatus } from "../services/api";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import { Sparkles, Search, Heart, Info } from "lucide-react";
import "../css/Recommendations.css";


function Recommendations() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mlStatus, setMlStatus] = useState(null);
    const {
        favourites,
        recommendationsCache,
        setRecommendationsCache
    } = useMovieContext();

    // Fetch ML status periodically
    useEffect(() => {
        const fetchMLStatus = async () => {
            try {
                const status = await getMLStatus();
                setMlStatus(status);
            } catch (err) {
                console.warn("Failed to fetch ML status:", err);
            }
        };

        fetchMLStatus();
        // Check status every 30 seconds while phase 1 is active
        const interval = setInterval(fetchMLStatus, 30000);
        return () => clearInterval(interval);
    }, []);

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

    const fetchRecommendations = async (forceRefresh = false) => {
        if (!favourites.length) {
            setRecommendationsCache([]);
            return;
        }

        // Don't refetch if we have data and not forcing refresh
        if (!forceRefresh && recommendationsCache.length > 0) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Balanced approach: Use top 5 favorites (middle ground)
            const favoriteTitles = favourites
                .slice(0, 5)
                .map(f => f.Title || f.movie_title || f.title)
                .filter(Boolean);

            if (favoriteTitles.length === 0) {
                setRecommendationsCache([]);
                setLoading(false);
                return;
            }

            // Parallel fetch with timeout
            const recommendationPromises = favoriteTitles.map(title =>
                Promise.race([
                    getSimilarByTitle(title, 6).catch(err => {
                        // console.warn(`Recommendation error for ${title}:`, err);
                        return { success: false, similar_movies: [] };
                    }),
                    new Promise(resolve => setTimeout(() => resolve({ success: false, similar_movies: [] }), 8000))
                ])
            );

            const recommendationResults = await Promise.all(recommendationPromises);

            const allTitles = new Set();
            const allRecs = [];

            // Existing favorites IDs to exclude from recommendations
            const favIds = new Set(favourites.map(f => f.imdbID || f.imdb_id));

            recommendationResults.forEach((data, index) => {
                if (data?.success && Array.isArray(data.similar_movies) && data.similar_movies.length > 0) {
                    data.similar_movies.forEach(rec => {
                        // Avoid duplicates and don't recommend movies already in favorites
                        if (rec.title && !allTitles.has(rec.title)) {
                            allTitles.add(rec.title);
                            allRecs.push(rec.title);
                        }
                    });
                } else if (!data?.success) {
                    // Log failed requests for debugging
                    // console.warn(`Failed to get recommendations for: ${favoriteTitles[index]}`);
                }
            });

            // Balanced: 30 recommendations (middle ground between 20 and 40)
            const limitedRecs = allRecs.slice(0, 30);

            if (limitedRecs.length === 0) {
                setRecommendationsCache([]);
                setLoading(false);
                return;
            }

            // Fetch details with balanced batch size
            const batchSize = 8;
            const allDetails = [];

            for (let i = 0; i < limitedRecs.length; i += batchSize) {
                const batch = limitedRecs.slice(i, i + batchSize);
                const batchPromises = batch.map(title =>
                    Promise.race([
                        getMovieByTitle(title).catch(() => null),
                        new Promise(resolve => setTimeout(() => resolve(null), 5000))
                    ])
                );
                const batchResults = await Promise.all(batchPromises);

                // Filter out nulls and already favorited movies
                const validMovies = batchResults.filter(m => m && m.Response === 'True' && !favIds.has(m.imdbID));
                allDetails.push(...validMovies);

                // Show progress by updating cache incrementally
                if (allDetails.length > 0) {
                    setRecommendationsCache([...allDetails]);
                }
            }

            setRecommendationsCache(allDetails);
        } catch (e) {
            // console.error("Recommendations error:", e);
            setError("Unable to generate recommendations at the moment.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch only if cache is empty and there are favorites
    useEffect(() => {
        if (favourites.length > 0 && recommendationsCache.length === 0) {
            // Only fetch if we have favorites but no cached recommendations
            fetchRecommendations(false);
        } else if (favourites.length === 0) {
            // Clear cache if no favorites
            setRecommendationsCache([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [favourites.length]);

    const moviesByGenre = groupMoviesByGenre(recommendationsCache);

    return (
        <div className="recommendations container">
            <div className="recommendations-header">
                <h1 className="page-title">
                    <span className="text-gradient-primary">For You</span>
                </h1>
                <p className="page-subtitle">
                    Personalized picks based on your collection.
                </p>
                {favourites.length > 0 && recommendationsCache.length > 0 && (
                    <p className="page-subtitle" style={{ fontSize: '0.85em', opacity: 0.7, marginTop: '0.5rem' }}>
                        💡 Updated your favorites? Click "Refresh Picks" to get new recommendations.
                    </p>
                )}

                {/* ML Status Indicator */}
                {mlStatus && mlStatus.loading_phase !== 'phase_2_complete' && (
                    <div className="ml-status-banner" style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <Info size={20} style={{ color: '#8b5cf6' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                {mlStatus.loading_phase === 'phase_1_complete' ? '🔄 Improving Recommendations' : '⚡ Quick Start Active'}
                            </div>
                            <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
                                {mlStatus.phase_message}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {favourites.length === 0 ? (
                <div className="empty-state glass-panel">
                    <Heart size={48} className="empty-icon" />
                    <h2>No favorites yet</h2>
                    <p>Add movies to your favorites to get personalized recommendations!</p>
                </div>
            ) : loading ? (
                <div className="loading-container">
                    <Sparkles className="spinner" size={48} />
                    <p className="mt-4">Curating your personal theater...</p>
                </div>
            ) : error ? (
                <div className="error-message glass-panel">{error}</div>
            ) : recommendationsCache.length === 0 ? (
                <div className="empty-state glass-panel">
                    <Search size={48} className="empty-icon" />
                    <h2>No recommendations found</h2>
                    <p>Try adding more diverse movies to your favorites.</p>
                </div>
            ) : (
                <>
                    <div className="recommendations-actions">
                        <button
                            className="refresh-btn glass-panel"
                            onClick={() => fetchRecommendations(true)}
                            disabled={loading}
                        >
                            <Sparkles size={16} />
                            Refresh Picks
                        </button>
                    </div>
                    {Object.entries(moviesByGenre).map(([genre, genreMovies]) => (
                        <div key={genre} className="genre-section">
                            <h2 className="genre-title">{genre}</h2>
                            <div className="movies-grid">
                                {genreMovies.map((movie) => (
                                    <MovieCard key={movie.imdbID} movie={movie} />
                                ))}
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

export default Recommendations;
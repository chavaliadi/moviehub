import { useEffect, useState } from "react";
import { getSimilarByTitle, getMovieByTitle } from "../services/api";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import { Sparkles, Search, Heart } from "lucide-react";
import "../css/Recommendations.css";

function Recommendations() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {
        favourites,
        recommendationsCache,
        setRecommendationsCache
    } = useMovieContext();

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

    const fetchRecommendations = async () => {
        if (!favourites.length) {
            setRecommendationsCache([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Use all favorites
            const favoriteTitles = favourites.map(f => f.Title).filter(Boolean);

            // Parallel fetch
            const recommendationPromises = favoriteTitles.map(title =>
                getSimilarByTitle(title, 5).catch(err => {
                    console.warn(`Recommendation error for ${title}:`, err);
                    return { success: false, similar_movies: [] };
                })
            );

            const recommendationResults = await Promise.all(recommendationPromises);

            const allTitles = new Set();
            const allRecs = [];

            // Existing favorites IDs to exclude from recommendations
            const favIds = new Set(favourites.map(f => f.imdbID));

            recommendationResults.forEach(data => {
                if (data?.success && Array.isArray(data.similar_movies)) {
                    data.similar_movies.forEach(rec => {
                        // Avoid duplicates and don't recommend movies already in favorites
                        if (!allTitles.has(rec.title)) {
                            allTitles.add(rec.title);
                            allRecs.push(rec.title);
                        }
                    });
                }
            });

            // Limit total recommendations
            const limitedRecs = allRecs.slice(0, 40);

            // Fetch details
            const batchSize = 10;
            const allDetails = [];

            for (let i = 0; i < limitedRecs.length; i += batchSize) {
                const batch = limitedRecs.slice(i, i + batchSize);
                const batchPromises = batch.map(title =>
                    getMovieByTitle(title).catch(() => null)
                );
                const batchResults = await Promise.all(batchPromises);

                // Filter out nulls and already favorited movies (double check with ID now)
                const validMovies = batchResults.filter(m => m && m.Response === 'True' && !favIds.has(m.imdbID));
                allDetails.push(...validMovies);
            }

            setRecommendationsCache(allDetails);
        } catch (e) {
            console.error("Recommendations error:", e);
            setError("Unable to generate recommendations at the moment.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when favorites change
    useEffect(() => {
        if (favourites.length > 0) {
            fetchRecommendations();
        } else {
            setRecommendationsCache([]); // Clear if no favorites
        }
    }, [favourites]);

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
                Object.entries(moviesByGenre).map(([genre, genreMovies]) => (
                    <div key={genre} className="genre-section">
                        <h2 className="genre-title">{genre}</h2>
                        <div className="movies-grid">
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
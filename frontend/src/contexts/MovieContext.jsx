import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const MovieContext = createContext();

export const useMovieContext = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
    const [favourites, setFavourites] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [ratings, setRatings] = useState({});
    const [selectedForRecommendations, setSelectedForRecommendations] = useState([]);
    const [recommendationsCache, setRecommendationsCache] = useState({});
    const [showRecommendationPopup, setShowRecommendationPopup] = useState(false);

    const { user } = useAuth();

    // Load/Save Favorites based on Auth state
    useEffect(() => {
        if (user) {
            // Load favorites and ratings from API
            const fetchData = async () => {
                try {
                    const favResponse = await axios.get('/api/favorites/');
                    setFavourites(favResponse.data);
                    
                    const watchlistResponse = await axios.get('/api/watchlist/');
                    setWatchlist(watchlistResponse.data);
                    
                    const ratResponse = await axios.get('/api/ratings/');
                    const ratingsDict = {};
                    ratResponse.data.forEach(r => {
                        ratingsDict[r.imdb_id] = r.score;
                    });
                    setRatings(ratingsDict);
                } catch (error) {
                    // console.error("Failed to fetch user data", error);
                }
            };
            fetchData();
        } else {
            // Load from local storage (for favorites only)
            const storedFavs = localStorage.getItem("favorites");
            if (storedFavs) setFavourites(JSON.parse(storedFavs));
            else setFavourites([]);
            setWatchlist([]); // Clear watchlist when logged out (no localStorage)
            setRatings({}); // Clear ratings when logged out
        }
    }, [user]);

    // Save favorites to local storage when not logged in to persist across reloads
    useEffect(() => {
        if (!user) {
            localStorage.setItem("favorites", JSON.stringify(favourites));
        }
    }, [favourites, user]);

    // Recommendations persistence
    useEffect(() => {
        const storedSelected = localStorage.getItem("selectedForRecommendations");
        const storedRecommendations = localStorage.getItem("recommendationsCache");

        if (storedSelected) setSelectedForRecommendations(JSON.parse(storedSelected));
        if (storedRecommendations) {
            try {
                const parsed = JSON.parse(storedRecommendations);
                if (Array.isArray(parsed)) {
                    // Migrate old array cache to new dict format
                    setRecommendationsCache({ "all": parsed });
                } else {
                    setRecommendationsCache(parsed);
                }
            } catch (e) {
                setRecommendationsCache({});
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('selectedForRecommendations', JSON.stringify(selectedForRecommendations));
    }, [selectedForRecommendations]);

    useEffect(() => {
        localStorage.setItem('recommendationsCache', JSON.stringify(recommendationsCache));
    }, [recommendationsCache]);


    const addToFavourites = async (movie) => {
        // Ensure movie object has necessary fields
        const movieData = {
            imdbID: movie.imdbID || movie.imdb_id,
            Title: movie.Title || movie.movie_title,
            Poster: movie.Poster || movie.movie_poster,
            Year: movie.Year || movie.movie_year,
            Type: movie.Type || movie.movie_type || 'movie'
        };

        if (user) {
            // Add to API
            try {
                const response = await axios.post('/api/favorites/', {
                    imdb_id: movieData.imdbID,
                    title: movieData.Title,
                    poster_path: movieData.Poster,
                    release_date: movieData.Year,
                    media_type: movieData.Type
                });

                // Update local state with response (which might have ID from DB)
                // But we want to keep frontend consistent
                if (response.status === 201 || response.status === 200) {
                    setFavourites(prev => {
                        if (prev.some(m => (m.imdb_id || m.imdbID) === movieData.imdbID)) return prev;
                        return [...prev, response.data || movieData];
                    });
                }
            } catch (error) {
                // console.error("Failed to add to favorites", error);
            }
        } else {
            setFavourites(prev => {
                if (prev.some(m => (m.imdb_id || m.imdbID) === movieData.imdbID)) return prev;
                return [...prev, movieData];
            });
        }
    };

    const removeFromFavourites = async (movieId) => {
        if (user) {
            // Remove from API
            try {
                await axios.delete(`/api/favorites/${movieId}`);
                setFavourites(prev => prev.filter(movie => (movie.imdb_id || movie.imdbID) !== movieId));
            } catch (error) {
                // console.error("Failed to remove from favorites", error);
            }
        } else {
            setFavourites(prev => prev.filter(movie => (movie.imdb_id || movie.imdbID) !== movieId));
        }
    };

    const isFavourite = (movieId) => {
        return favourites.some(movie => (movie.imdb_id || movie.imdbID) === movieId);
    };

    const addToWatchlist = async (movie) => {
        if (!user) return false;
        
        const movieData = {
            imdbID: movie.imdbID || movie.imdb_id,
            Title: movie.Title || movie.movie_title,
            Poster: movie.Poster || movie.movie_poster,
            Year: movie.Year || movie.movie_year,
            Type: movie.Type || movie.movie_type || 'movie'
        };

        try {
            const response = await axios.post('/api/watchlist/', {
                imdb_id: movieData.imdbID,
                title: movieData.Title,
                poster_path: movieData.Poster,
                release_date: movieData.Year,
                media_type: movieData.Type
            });

            if (response.status === 201 || response.status === 200) {
                setWatchlist(prev => {
                    if (prev.some(m => (m.imdb_id || m.imdbID) === movieData.imdbID)) return prev;
                    return [...prev, response.data || movieData];
                });
                return true;
            }
        } catch (error) {
            return false;
        }
        return false;
    };

    const removeFromWatchlist = async (movieId) => {
        if (!user) return false;
        
        try {
            await axios.delete(`/api/watchlist/${movieId}`);
            setWatchlist(prev => prev.filter(movie => (movie.imdb_id || movie.imdbID) !== movieId));
            return true;
        } catch (error) {
            return false;
        }
    };

    const isInWatchlist = (movieId) => {
        return watchlist.some(movie => (movie.imdb_id || movie.imdbID) === movieId);
    };

    const rateMovie = async (movie, score) => {
        if (!user) return false;
        
        const imdbID = movie.imdbID || movie.imdb_id;
        
        try {
            await axios.post('/api/ratings/', {
                imdb_id: imdbID,
                score: score,
                title: movie.Title || movie.movie_title,
                poster_path: movie.Poster || movie.movie_poster,
                release_date: movie.Year || movie.movie_year,
                media_type: movie.Type || movie.movie_type || 'movie'
            });
            
            setRatings(prev => ({
                ...prev,
                [imdbID]: score
            }));
            return true;
        } catch (error) {
            // console.error("Failed to rate movie", error);
            return false;
        }
    };

    const removeRating = async (movieId) => {
        if (!user) return false;
        
        try {
            await axios.delete(`/api/ratings/${movieId}`);
            setRatings(prev => {
                const newRatings = { ...prev };
                delete newRatings[movieId];
                return newRatings;
            });
            return true;
        } catch (error) {
            // console.error("Failed to remove rating", error);
            return false;
        }
    };

    const value = {
        favourites,
        ratings,
        addToFavourites,
        removeFromFavourites,
        isFavourite,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        rateMovie,
        removeRating,
        selectedForRecommendations,
        setSelectedForRecommendations,
        recommendationsCache,
        setRecommendationsCache,
        showRecommendationPopup,
        setShowRecommendationPopup
    };

    return (
        <MovieContext.Provider value={value}>
            {children}
        </MovieContext.Provider>
    );
};

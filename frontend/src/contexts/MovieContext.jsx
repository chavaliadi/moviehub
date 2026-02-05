import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const MovieContext = createContext();

export const useMovieContext = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
    const [favourites, setFavourites] = useState([]);
    const [selectedForRecommendations, setSelectedForRecommendations] = useState([]);
    const [recommendationsCache, setRecommendationsCache] = useState([]);
    const [showRecommendationPopup, setShowRecommendationPopup] = useState(false);

    const { user } = useAuth();

    // Load/Save Favorites based on Auth state
    useEffect(() => {
        if (user) {
            // Load favorites from API
            const fetchFavorites = async () => {
                try {
                    const response = await axios.get('/api/favorites/');
                    setFavourites(response.data);
                } catch (error) {
                    // console.error("Failed to fetch favorites", error);
                }
            };
            fetchFavorites();
        } else {
            // Load from local storage
            const storedFavs = localStorage.getItem("favorites");
            if (storedFavs) setFavourites(JSON.parse(storedFavs));
            else setFavourites([]);
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
        if (storedRecommendations) setRecommendationsCache(JSON.parse(storedRecommendations));
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

    const value = {
        favourites,
        addToFavourites,
        removeFromFavourites,
        isFavourite,
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

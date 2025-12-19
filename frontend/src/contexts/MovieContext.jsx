import { createContext, useState, useEffect, useContext } from "react";

const MovieContext = createContext();

export const useMovieContext = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
    const [favourites, setFavourites] = useState([]);
    const [selectedForRecommendations, setSelectedForRecommendations] = useState([]);
    const [recommendationsCache, setRecommendationsCache] = useState([]);
    const [showRecommendationPopup, setShowRecommendationPopup] = useState(false);

    useEffect(() => {
        const storedFavs = localStorage.getItem("favourites");
        const storedSelected = localStorage.getItem("selectedForRecommendations");
        const storedRecommendations = localStorage.getItem("recommendationsCache");

        if (storedFavs) setFavourites(JSON.parse(storedFavs));
        if (storedSelected) setSelectedForRecommendations(JSON.parse(storedSelected));
        if (storedRecommendations) setRecommendationsCache(JSON.parse(storedRecommendations));
    }, []);

    useEffect(() => {
        localStorage.setItem('favourites', JSON.stringify(favourites));
    }, [favourites]);

    useEffect(() => {
        localStorage.setItem('selectedForRecommendations', JSON.stringify(selectedForRecommendations));
    }, [selectedForRecommendations]);

    useEffect(() => {
        localStorage.setItem('recommendationsCache', JSON.stringify(recommendationsCache));
    }, [recommendationsCache]);

    const addToFavourites = (movie) => {
        setFavourites((prev) => {
            if (!movie?.imdbID && movie?.Title) {
                // Minimal shape fallback if added from recommendations
                movie = { ...movie, imdbID: movie.imdbID || `tt-${movie.Title}` };
            }
            if (prev.some(m => m.imdbID === movie.imdbID)) return prev;
            return [...prev, movie];
        });
    };

    const removeFromFavourites = (movieId) => {
        setFavourites((prev) => prev.filter((movie) => movie.imdbID !== movieId));
    };

    const isFavourite = (movieId) => {
        return favourites.some((movie) => movie.imdbID === movieId);
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
        setShowRecommendationPopup,
    };

    return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};

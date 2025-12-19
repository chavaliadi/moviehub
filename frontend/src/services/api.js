/* const API_KEY = "18e217aa";
const BASE_URL = "http://www.omdbapi.com"

export const getPopularMovies = async () => {
    const response = await fetch (`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    const data = await response.json()
    return data.results
};

export const searchMovies = async (query) => {
    const response = await fetch (
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );
    const data = await response.json()
    return data.results
}; */

const API_KEY = "18e217aa";
const BASE_URL = "https://www.omdbapi.com";
const BACKEND_URL = "http://localhost:5001"; // Flask backend

export const searchMovies = async (query) => {
    const response = await fetch(`${BASE_URL}/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (data.Response === "True") {
        return data.Search;
    } else {
        throw new Error(data.Error);
    }
};

export const getPopularMovies = async () => {
    return searchMovies("Lotr");
};

// ML endpoints - minimal integration
export const getUserRecommendations = async (userId, limit = 10) => {
    const url = `${BACKEND_URL}/api/ml/recommendations/user?user_id=${encodeURIComponent(userId)}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch recommendations");
    return res.json();
};

export const getSimilarByTitle = async (title, limit = 10) => {
    const url = `${BACKEND_URL}/api/ml/recommendations/similar?title=${encodeURIComponent(title)}&limit=${limit}`;
    try {
        const res = await fetch(url);
        // Try to parse JSON even on non-200 responses
        const data = await res.json().catch(() => null);
        if (!res.ok) {
            return data || { success: false, error: `HTTP ${res.status}`, similar_movies: [] };
        }
        return data;
    } catch (err) {
        return { success: false, error: err?.message || 'Network error', similar_movies: [] };
    }
};

export const getMovieByTitle = async (title) => {
    const res = await fetch(`${BASE_URL}/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`);
    const data = await res.json();
    return data?.Response === 'True' ? data : null;
};
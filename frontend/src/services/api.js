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
/* import { useState, useEffect } from "react"
import { searchMovies, getPopularMovies } from "../services/api";
import MovieCard from "../components/MovieCard"
import "../css/Home.css"

function Home() { 

    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadPopularMovies = async () => {
            try{
                const popularMovies = await getPopularMovies()
                setMovies(popularMovies)
            } catch (err) {
                console.log(err)
                setError("Failed to load movies...")
            }
            finally {
                setLoading(false)
            }
        }

        loadPopularMovies()
        
    }, [])

    // const handleSearch = (e) => {
        e.preventDefault()
        alert(searchQuery)
        setSearchQuery("")
    } // 

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const results = await searchMovies(searchQuery);
            setMovies(results);
            setError(null);
        } catch (err) {
            setError("Movie not found.");
            setMovies([]);
        } finally {
            setLoading(false);
            setSearchQuery("");
        }
    };
    
    return(
        <div className="home">

            <form onSubmit={handleSearch} className="search-form">
                <input 
                    type="text" 
                    placeholder="Search for movies..." 
                    className="search-movies"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
                <button type="submit" className="search-btn">Submit</button>
            </form>

            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}

            <div className="movies-grid">
                {movies.map(
                    (movie) => 
                     movie.title.toLowerCase().startsWith(searchQuery) && (
                    <MovieCard movie={movie} key={movie.id}/>
                    ) 
                )}
            </div>
        </div>
    )
}

export default Home */

/* // import { useState, useEffect } from "react";
import { searchMovies, getPopularMovies } from "../services/api";
import MovieCard from "../components/MovieCard";
import "../css/Home.css";

function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const data = await getPopularMovies();
                setMovies(data);
                setError(null);
            } catch (err) {
                setError("Failed to load movies");
            } finally {
                setLoading(false);
            }
        };

        fetchPopular();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setLoading(true);
            const results = await searchMovies(searchQuery);
            setMovies(results);
            setError(null);
        } catch (err) {
            setError("Movie not found");
            setMovies([]);
        } finally {
            setLoading(false);
            setSearchQuery("");
        }
    };

    return (
        <div className="home">
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search for movies..."
                    className="search-movies"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-btn">Search</button>
            </form>

            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}

            <div className="movies-grid">
                {movies.map((movie) => (
                    <MovieCard key={movie.imdbID} movie={movie} />
                ))}
            </div>
        </div>
    );
}

export default Home; // */

import { useState, useEffect } from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard"; 
import "../css/Home.css";

const API_KEY = "18e217aa";  
const BASE_URL = "http://www.omdbapi.com/";

function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMovies = async (query = "movie") => {
        try {
            setLoading(true);
            const response = await axios.get(BASE_URL, {
                params: {
                    apiKey: API_KEY,
                    s: query,
                    type: "movie",
                    page: 1,
                },
            });

            if (response.data.Response === "True") {
                setMovies(response.data.Search);
            } else {
                setError("No movies found");
            }
        } catch (err) {
            setError("Failed to fetch movies");
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMovies(searchQuery);
    };

    return (
        <div className="home">
            <form className="search-form" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search for movies..."
                    className="search-movies"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-btn">
                    Search
                </button>
            </form>

            {error && <p>{error}</p>}
            {loading && <p>Loading...</p>}

            <div className="movies-grid">
                {movies.length > 0 && !loading ? (
                    movies.map((movie) => (
                        <MovieCard key={movie.imdbID} movie={movie} />
                    ))
                ) : (
                    <p>No movies available</p>
                )}
            </div>
        </div>
    );
}

export default Home;



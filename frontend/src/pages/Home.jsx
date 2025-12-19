import { useState, useEffect } from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import MovieFilters from "../components/MovieFilters";
import "../css/Home.css";

const API_KEY = "18e217aa";
const BASE_URL = "http://www.omdbapi.com/";

function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);

    // Advanced search features (future use)
    const [showFilters, setShowFilters] = useState(false);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        type: 'movie',
        sortBy: 'relevance'
    });

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        // If we have a search query, re-search with new filters
        if (hasSearched && searchQuery) {
            setCurrentPage(1);
            setMovies([]);
            fetchMovies(searchQuery, 1, newFilters);
        }
    };

    // Category seeds for mixed homepage
    const categorySeeds = [
        "Marvel", "DC", "Telugu", "Bollywood", "Hollywood", "Pixar", "Disney",
        "Tamil", "Kannada", "Malayalam", "Anime", "Thriller", "Comedy",
        "Romance", "Action", "Sci-Fi", "Horror", "Drama", "Adventure"
    ];

    const dedupeByImdb = (list) => {
        const seen = new Set();
        const out = [];
        for (const m of list) {
            if (!m?.imdbID) continue;
            if (!seen.has(m.imdbID)) {
                seen.add(m.imdbID);
                out.push(m);
            }
        }
        return out;
    };

    const shuffle = (arr) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    // Fetch a mixed set of movies from multiple categories in parallel
    const fetchMixedMovies = async (countTerms = 4) => {
        setLoading(true);
        setError(null);
        try {
            const terms = shuffle(categorySeeds).slice(0, countTerms);
            const requests = terms.map((term) => {
                const randomPage = 1 + Math.floor(Math.random() * 3);
                return axios.get(BASE_URL, {
                    params: { apiKey: API_KEY, s: term, type: "movie", page: randomPage },
                });
            });
            const responses = await Promise.allSettled(requests);
            let combined = [];
            for (const r of responses) {
                if (r.status === "fulfilled" && r.value?.data?.Response === "True") {
                    combined = combined.concat(r.value.data.Search || []);
                }
            }
            const unique = dedupeByImdb(combined);
            const mixed = shuffle(unique).slice(0, 20);
            setMovies((prev) => currentPage === 1 && !hasSearched ? mixed : [...prev, ...mixed]);
        } catch (e) {
            setError("Failed to fetch movies. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchMovies = async (query = "", page = 1, searchFilters = filters) => {
        try {
            setLoading(true);
            setError(null);
            const params = {
                apiKey: API_KEY,
                s: query,
                page: page,
            };

            // Add filters to params
            if (searchFilters.type) params.type = searchFilters.type;
            if (searchFilters.year) params.y = searchFilters.year;

            const response = await axios.get(BASE_URL, { params });

            if (response.data.Response === "True") {
                const newMovies = response.data.Search || [];
                if (page === 1) {
                    setMovies(newMovies);
                } else {
                    setMovies(prev => [...prev, ...newMovies]);
                }

                const total = parseInt(response.data.totalResults) || 0;
                setTotalResults(total);
                setTotalPages(Math.ceil(total / 10));
                setCurrentPage(page);
            } else {
                if (page === 1) {
                    setMovies([]);
                    setError("No movies found");
                }
            }
        } catch (err) {
            setError("Failed to fetch movies. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Mixed categories for homepage rows
        fetchMixedMovies(5);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setHasSearched(true);
            setCurrentPage(1);
            setMovies([]);
            fetchMovies(searchQuery.trim(), 1, filters);
        }
    };

    const loadMoreMovies = () => {
        if (hasSearched) {
            if (!loading && currentPage < totalPages) {
                const nextPage = currentPage + 1;
                fetchMovies(searchQuery, nextPage);
            }
        } else {
            // On homepage (no search), append another mixed batch
            fetchMixedMovies(4);
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        setHasSearched(false);
        setCurrentPage(1);
        setMovies([]);
        setError(null);
        fetchMixedMovies(5);
    };

    return (
        <div className="home">
            <form className="search-form" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search for movies..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-btn">
                    🔍 Search
                </button>
                {hasSearched && (
                    <button
                        type="button"
                        className="clear-btn"
                        onClick={clearSearch}
                    >
                        ✕ Clear
                    </button>
                )}
            </form>

            <MovieFilters
                onFiltersChange={handleFiltersChange}
                currentFilters={filters}
            />

            {error && <div className="error-message">{error}</div>}

            {loading && movies.length === 0 && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Searching for amazing movies...</p>
                </div>
            )}

            <div className="movies-grid">
                {movies.map((movie) => (
                    <MovieCard key={`${movie.imdbID}-${hasSearched ? currentPage : 'mix'}`} movie={movie} />
                ))}
            </div>

            {movies.length > 0 && (
                <div className="pagination-container">
                    <button
                        className="load-more-btn"
                        onClick={loadMoreMovies}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="loading-spinner-small"></div>
                                Loading...
                            </>
                        ) : (
                            <>
                                📚 Load More Movies
                            </>
                        )}
                    </button>
                </div>
            )}

            {!loading && hasSearched && movies.length === 0 && !error && (
                <div className="no-movies">
                    <p>No movies available. Try searching for something!</p>
                </div>
            )}
        </div>
    );
}

export default Home;



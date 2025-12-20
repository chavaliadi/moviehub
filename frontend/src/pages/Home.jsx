import { useState, useEffect } from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import MovieFilters from "../components/MovieFilters";
import { Search, Loader2, X } from "lucide-react";
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

    // Advanced search features
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        type: 'movie',
        sortBy: 'relevance'
    });

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);

        // If we have a search query, fetch immediately
        if (searchQuery) {
            setCurrentPage(1);
            setMovies([]);
            fetchMovies(searchQuery, 1, newFilters);
        } else {
            // If no search query but filters are applied, try searching by genre or default "movie"
            const searchTerm = newFilters.genre || "movie";
            setSearchQuery(searchTerm); // Set the query visible to user? Maybe.
            setCurrentPage(1);
            setMovies([]);
            setHasSearched(true);
            fetchMovies(searchTerm, 1, newFilters);
        }
    };

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
                type: searchFilters.type || 'movie'
            };

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
                    setError("No movies found matching your search.");
                }
            }
        } catch (err) {
            setError("Failed to fetch movies. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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
        <div className="home container">
            <div className="hero-section">
                <h1 className="hero-title">
                    Discover <span className="text-gradient-primary">Cinema</span>
                </h1>
                <p className="hero-subtitle">
                    Explore millions of movies, from timeless classics to the latest blockbusters.
                </p>

                <form className="search-wrapper glass-panel" onSubmit={handleSearch}>
                    <Search className="search-icon" size={24} />
                    <input
                        type="text"
                        placeholder="What do you want to watch?"
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {hasSearched && (
                        <button
                            type="button"
                            className="clear-search-btn"
                            onClick={clearSearch}
                        >
                            <X size={20} />
                        </button>
                    )}
                    <button type="submit" className="search-btn-primary">
                        Search
                    </button>
                </form>

                <MovieFilters
                    onFiltersChange={handleFiltersChange}
                    currentFilters={filters}
                />
            </div>

            {error && <div className="error-message glass-panel">{error}</div>}

            {loading && movies.length === 0 && (
                <div className="loading-container">
                    <Loader2 className="spinner" size={48} />
                    <p>Curating your experience...</p>
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
                        className="load-more-btn glass-panel"
                        onClick={loadMoreMovies}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="spinner" size={20} />
                                Loading...
                            </>
                        ) : (
                            "Load More Movies"
                        )}
                    </button>
                </div>
            )}

            {!loading && hasSearched && movies.length === 0 && !error && (
                <div className="no-movies">
                    <p>No results found. Try a different query.</p>
                </div>
            )}
        </div>
    );
}

export default Home;



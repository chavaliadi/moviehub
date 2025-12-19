import { useState, useEffect } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import "../css/MovieFilters.css";

function MovieFilters({ onFiltersChange, currentFilters }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        genre: '',
        year: '',
        type: 'movie',
        sortBy: 'relevance',
        ...currentFilters
    });

    const genres = [
        'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
        'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Music',
        'Mystery', 'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'
    ];

    const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

    const types = [
        { value: 'movie', label: 'Movies' },
        { value: 'series', label: 'TV Series' },
        { value: 'episode', label: 'Episodes' }
    ];

    const sortOptions = [
        { value: 'relevance', label: 'Relevance' },
        { value: 'year', label: 'Year' },
        { value: 'title', label: 'Title' }
    ];

    useEffect(() => {
        onFiltersChange(localFilters);
    }, [localFilters]);

    const handleFilterChange = (key, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        const resetFilters = {
            genre: '',
            year: '',
            type: 'movie',
            sortBy: 'relevance'
        };
        setLocalFilters(resetFilters);
    };

    const activeFilterCount = Object.values(localFilters).filter(val =>
        val && val !== 'movie' && val !== 'relevance'
    ).length;

    return (
        <div className={`movie-filters glass-panel ${isExpanded ? 'expanded' : ''}`}>
            <div className="filters-header">
                <button
                    className="filters-toggle"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <Filter className="filter-icon" size={20} />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="filter-count">{activeFilterCount}</span>
                    )}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {activeFilterCount > 0 && (
                    <button className="clear-filters" onClick={clearFilters}>
                        Clear All
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className="filters-content">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>Genre</label>
                            <select
                                value={localFilters.genre}
                                onChange={(e) => handleFilterChange('genre', e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Genres</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Year</label>
                            <select
                                value={localFilters.year}
                                onChange={(e) => handleFilterChange('year', e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Any Year</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Type</label>
                            <select
                                value={localFilters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="filter-select"
                            >
                                {types.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Sort By</label>
                            <select
                                value={localFilters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                className="filter-select"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {activeFilterCount > 0 && (
                        <div className="active-filters">
                            <span className="active-filters-label">Active:</span>
                            <div className="filter-chips">
                                {localFilters.genre && (
                                    <span className="filter-chip">
                                        {localFilters.genre}
                                        <button onClick={() => handleFilterChange('genre', '')}>
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {localFilters.year && (
                                    <span className="filter-chip">
                                        {localFilters.year}
                                        <button onClick={() => handleFilterChange('year', '')}>
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {localFilters.type !== 'movie' && (
                                    <span className="filter-chip">
                                        {types.find(t => t.value === localFilters.type)?.label}
                                        <button onClick={() => handleFilterChange('type', 'movie')}>
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {localFilters.sortBy !== 'relevance' && (
                                    <span className="filter-chip">
                                        {sortOptions.find(s => s.value === localFilters.sortBy)?.label}
                                        <button onClick={() => handleFilterChange('sortBy', 'relevance')}>
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MovieFilters;
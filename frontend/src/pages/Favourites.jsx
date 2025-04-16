import "../css/Favourites.css"
import { useMovieContext } from "../contexts/MovieContext"
import MovieCard from "../components/MovieCard"

function Favourites() { 
    const {favourites} = useMovieContext();

    if (favourites) {
        return (
            <>
                <div>
                    <h3>Your Favourites</h3>
                </div>

                <div className="movies-grid">
                    {favourites.length > 0 ? (
                        favourites.map((movie) => (
                            <MovieCard key={movie.imdbID} movie={movie} />
                        ))
                    ) : (
                        <p>No movies available</p>
                    )}
                </div>
            </>
        )
    }

    return (
        <div className="favourites-empty">
            <h3>No favourites Yet</h3>
            <p>Start adding movies</p>
        </div>
    );
}

export default Favourites;

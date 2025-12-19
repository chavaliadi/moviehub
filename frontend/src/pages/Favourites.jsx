import "../css/Favourites.css"
import { useMovieContext } from "../contexts/MovieContext"
import MovieCard from "../components/MovieCard"

function Favourites() { 
    const {favourites} = useMovieContext();

    if (favourites) {
        return (
            <>
                <div className="container mt-4 mb-3">
                    {/* <h2>Your Favourites</h2> */}
                </div>

                <div className="movies-grid">
                    {favourites.length > 0 ? (
                        favourites.map((movie) => (
                            <MovieCard key={movie.imdbID} movie={movie} />
                        ))
                    ) : (
                        <div className="no-movies">
                            <p>No favourites yet. Go to Home and add some!</p>
                        </div>
                    )}
                </div>
            </>
        )
    }

    return (
        <div className="no-movies">
            <p>No favourites yet. Go to Home and add some!</p>
        </div>
    );
}

export default Favourites;

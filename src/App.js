import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY ="7bcaac56";

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState("");



  function handleSelectMovieDetails(id){
    setSelectedId((selectedId)=>(selectedId === id ? null : id));
  }

  function handleCloseMovieDetails(){
    setSelectedId(null);
  }

  function handleAddWatchedMovie(movie){
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatchedMovie(id){
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }


  useEffect(function(){
    function callback(e){
      if(e.key === "Escape"){
        handleCloseMovieDetails();
      }
    } 

    document.addEventListener("keydown", callback );

    return function(){
      document.removeEventListener('keydown', callback)
    }
  }, []);
  
  useEffect(
    function(){
      const controller = new AbortController();
      async function fetchMovies() {
      
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(`http://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`, {signal: controller.signal});

        if (!res.ok) throw new Error("Something went wrong with fetching the movies");

        const data = await res.json();
        if (data.Response === "False") throw new Error("Movie not found");

        setMovies(data.Search);
        console.log(data.Search);
      } catch (error) {
        console.error(error.message);
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if(query.length < 2){
      setMovies([]);
      setError("");
      return;
    }

    handleCloseMovieDetails();

    fetchMovies();
    return function(){
      controller.abort();
    };
  }, [query]);

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovieDetails} />}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? ( <MovieDetails selectedId={selectedId} 
              onCloseMovie={handleCloseMovieDetails}
              onAddWatched={handleAddWatchedMovie} 
              watched={watched} />
          ):(
          <>
            <WatchedSummary watched={watched} />
            <WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatchedMovie} />
          </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>❗</span>{message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img" aria-label="popcorn">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({movies}){
  return(
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}

function Main({children}){

  return(
    <main className="main">
      {children}
    </main>
  );
}

function Box({children}){
  
  const [isOpen, setIsOpen] = useState(true);
  return(
    <div className="box">
          <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? "–" : "+"}
          </button>
          {isOpen && 
            children
          }
        </div>
  )
}

function MovieList({movies, onSelectMovie}){
  
  return(
  <ul className="list list-movies">
              {movies?.map((movie) => (
              <Movie movie ={movie} key={movie.imdbID}
              onSelectMovie={onSelectMovie}
              />
              ))}
    </ul>
  );
}

function Movie({movie, onSelectMovie}){
  return(
  <li onClick={()=>onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
        <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>🗓</span>
              <span>{movie.Year}</span>
            </p>
          </div>
  </li>
  );
}

/*
function WatchedBox(){

  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return(
    <div className="box">
          <button
            className="btn-toggle"
            onClick={() => setIsOpen2((open) => !open)}
          >
            {isOpen2 ? "–" : "+"}
          </button>
          {isOpen2 && (
            <>
              <WachedSummary watched={watched} />
              <WatchedMoviesList watched={watched}/>

              
            </>
          )}
        </div>
  )
}
*/

function MovieDetails({selectedId, onCloseMovie, onAddWatched,watched}){
  const [movieDetails, setMovieDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find((movie) => movie.imdbID === selectedId)?.userRating;

  const {Title: title, 
    Year: year, 
    Poster: poster, 
    Runtime: runtime, 
    imdbRating, 
    Plot: plot, 
    Released: released, 
    Actors: actors, 
    Director: director,
    Genre:genre} = movieDetails;

    function handleAdd(){ 
      const newMovie = {
        imdbID: selectedId,
        Title: title,
        Year: year,
        Poster: poster,
        runtime: parseInt(runtime),
        imdbRating: parseFloat(imdbRating),
        userRating: userRating
      };
      onAddWatched(newMovie);
      onCloseMovie();
    }

  useEffect(()=>{
    async function fetchMovieDetails(){
      setIsLoading(true);
      try{
        const res = await fetch(`http://www.omdbapi.com/?i=${selectedId}&apikey=${KEY}`);
        if(!res.ok) throw new Error("Something went wrong with fetching the movie details");

        const data = await res.json();
        setMovieDetails(data);
        setIsLoading(false);
      }catch(error){
        console.error(error.message);
      }
    }

    fetchMovieDetails();
  }
  , [selectedId]
);

useEffect(function(){
  if (!title) return;
  document.title=`Movie | ${title}`;
  return function(){
    document.title = "usePopcorn";
  };

  },[title]);

  return(
    <div className="details">
      {isLoading ? <Loader/> :
      <>
      <header> 

      <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
      <img src={poster} alt={`${title} poster`} />
      <div className="details-overview"> 
        <h2>{title} ({year})</h2>
        <p>{released} &bull; {runtime}</p>
        <p>{genre}</p>
        <p><span>⭐</span>{imdbRating} IMDb rating</p>
      </div>  
      </header>

      <section>
        <div className="rating">
          { !isWatched ?
          <>
          <StarRating maxRating={10} size={24}
          onSetRating={setUserRating}/>

          {userRating > 0 && (<button className="btn-add" onClick={handleAdd}>+ Add to watched list</button>)}</>:
          <p>You watched and rated this movie: {watchedUserRating}⭐</p>}
        </div>
        <p><em>{plot}</em></p>
        <p><strong>Actors:</strong> {actors}</p>
        <p><strong>Director:</strong> {director}</p>
      </section>  
      </>
      }
    </div>
    
  );

}


function WatchedSummary({watched}){

  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return(
    <div className="summary">
                <h2>Movies you watched</h2>
                <div>
                  <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                  </p>
                  <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating.toFixed(2)}</span>
                  </p>
                  <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed(2)}</span>
                  </p>
                  <p>
                    <span>⏳</span>
                    <span>{avgRuntime.toFixed(2)} min</span>
                  </p>
                </div>
              </div>
  )
}

function WatchedMoviesList({watched,onDeleteWatched}){
  return (
    <ul className="list">
      {watched.map((movie) => (
        <li key={movie.imdbID}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>⭐️</span>
              <span>{movie.imdbRating}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{movie.userRating}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{movie.runtime} min</span>
            </p>
          </div>
          <button
            className="btn-delete"
            onClick={() => onDeleteWatched(movie.imdbID)}
          >
            X
          </button>
        </li>
      ))}
    </ul>
  );
}

import React, { useEffect, useState } from 'react';
import './FindMovie.scss';
import { getMovie } from '../../api';
import { MovieData } from '../../types/MovieData';
import { ResponseError } from '../../types/ReponseError';
import { Movie } from '../../types/Movie';
import { MovieCard } from '../MovieCard';

type Props = {
  movies: Movie[];
  addToList(movies: Movie[]): void;
};

export const FindMovie: React.FC<Props> = ({ movies, addToList }) => {
  const [movieData, setMovieData] = useState<MovieData | ResponseError>();
  const [movie, setMovie] = useState<Movie>();
  const [inputValue, setInputValue] = useState('');
  const [isPrewiewRendered, setIsPrewiewRendered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);

  function mormalizeMovieData(data: MovieData) {
    return {
      title: data.Title,
      description: data.Plot,
      imgUrl:
        data.Poster !== 'N/A'
          ? data.Poster
          : 'https://via.placeholder.com/360x270.png?text=no%20preview',
      imdbUrl: `https://www.imdb.com/title/${data.imdbID}`,
      imdbId: data.imdbID,
    };
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setIsError(false);
  };

  const handleFindButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLoading(true);

    getMovie(inputValue)
      .then(setMovieData)
      .catch(() => setIsError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (movieData && (movieData as MovieData).Plot !== undefined) {
      setMovie(mormalizeMovieData(movieData as MovieData));
      setIsPrewiewRendered(true);
      setShowAddButton(true);
    }

    if (movieData && (movieData as MovieData).Plot === undefined) {
      setIsError(true);
    }
  }, [movieData]);

  const newMovies = [...movies];

  if (
    movie &&
    newMovies.find(mov => mov.imdbId === movie.imdbId) === undefined
  ) {
    newMovies.push(movie);
  }

  const handleAddButton = () => {
    setIsPrewiewRendered(false);
    addToList(newMovies);
    setInputValue('');
    setShowAddButton(false);
    setIsError(false);
  };

  return (
    <>
      <form className="find-movie">
        <div className="field">
          <label className="label" htmlFor="movie-title">
            Movie title
          </label>

          <div className="control">
            <input
              onChange={handleInputChange}
              value={inputValue}
              data-cy="titleField"
              type="text"
              id="movie-title"
              placeholder="Enter a title to search"
              className={`input ${isError && 'is-danger'}`}
            />
          </div>

          {isError && (
            <p className="help is-danger" data-cy="errorMessage">
              Can&apos;t find a movie with such a title
            </p>
          )}
        </div>

        <div className="field is-grouped">
          <div className="control">
            <button
              onClick={handleFindButton}
              data-cy="searchButton"
              type="submit"
              className={`button is-light ${loading && 'is-loading'}`}
              disabled={inputValue === ''}
            >
              {!isPrewiewRendered ? 'Find a movie' : 'Search again'}
            </button>
          </div>

          {showAddButton && (
            <div className="control">
              <button
                onClick={handleAddButton}
                data-cy="addButton"
                type="button"
                className="button is-primary"
              >
                Add to the list
              </button>
            </div>
          )}
        </div>
      </form>

      {isPrewiewRendered && (
        <div className="container" data-cy="previewContainer">
          <h2 className="title">Preview</h2>
          <MovieCard movie={movie} />
        </div>
      )}
    </>
  );
};

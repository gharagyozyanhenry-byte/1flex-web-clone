const API_KEY = 'e0b203e42e12587b6ce507b8aa452e8c';
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const IMAGE_ORIGINAL = 'https://image.tmdb.org/t/p/original';

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  backdrop_path: string;
  media_type?: 'movie' | 'tv';
}

export interface MovieDetail {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  last_air_date?: string;
  vote_average: number;
  overview: string;
  tagline?: string;
  runtime?: number;
  genres: { id: number; name: string }[];
  status?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

async function fetchFromTMDB(endpoint: string) {
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}&language=en-US`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('TMDB Fetch Error:', error);
    return [];
  }
}

async function fetchOne(endpoint: string) {
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}&language=en-US`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const movieApi = {
  getTrending: async () => {
    const results = await fetchFromTMDB('trending/all/week');
    return results.map((m: any) => ({ ...m, media_type: m.media_type || (m.first_air_date ? 'tv' : 'movie') }));
  },
  getUpcoming: async () => {
    const results = await fetchFromTMDB('movie/upcoming');
    return results.map((m: any) => ({ ...m, media_type: 'movie' }));
  },
  getPopularMovies: async () => {
    const results = await fetchFromTMDB('movie/popular');
    return results.map((m: any) => ({ ...m, media_type: 'movie' }));
  },
  getPopularTv: async () => {
    const results = await fetchFromTMDB('tv/popular');
    return results.map((m: any) => ({ ...m, media_type: 'tv' }));
  },
  search: (query: string) => fetchFromTMDB(`search/multi?query=${encodeURIComponent(query)}`),
  getVideos: async (id: number, type: 'movie' | 'tv') => {
    try {
      const res = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=en-US`);
      const data = await res.json();
      const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
      return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
    } catch {
      return null;
    }
  },
  /** Full movie/TV details including genres, runtime, tagline */
  getDetails: async (id: number, type: 'movie' | 'tv'): Promise<MovieDetail | null> => {
    return fetchOne(`${type}/${id}`);
  },
  /** Cast (top 10) */
  getCredits: async (id: number, type: 'movie' | 'tv'): Promise<CastMember[]> => {
    const data = await fetchOne(`${type}/${id}/credits`);
    return (data?.cast || []).slice(0, 12);
  },
  /** Similar movies/shows */
  getSimilar: async (id: number, type: 'movie' | 'tv'): Promise<Movie[]> => {
    return fetchFromTMDB(`${type}/${id}/similar`);
  },
};

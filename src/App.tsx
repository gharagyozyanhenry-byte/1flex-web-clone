import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MovieCard } from './components/MovieCard';
import { MovieModal } from './components/MovieModal';
import MovieDetail from './components/MovieDetail';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { movieApi, Movie } from './lib/api';
import { TrendingUp, Tv, Sparkles, Film, Star, Clock, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  // Hash-based routing for movie/TV detail pages
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const [trending, setTrending] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [popularTv, setPopularTv] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [airingToday, setAiringToday] = useState<Movie[]>([]);
  const [onTheAir, setOnTheAir] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'movies' | 'tv'>('all');

  useEffect(() => {
    const loadData = async () => {
      const [trendingData, upcomingData, tvData, nowPlayingData, topRatedData, airingData, onAirData] = await Promise.all([
        movieApi.getTrending(),
        movieApi.getUpcoming(),
        movieApi.getPopularTv(),
        movieApi.getNowPlaying(),
        movieApi.getTopRatedMovies(),
        movieApi.getAiringToday(),
        movieApi.getOnTheAir(),
      ]);
      setTrending(trendingData.slice(0, 12));
      setUpcoming(upcomingData.slice(0, 12));
      setPopularTv(tvData.slice(0, 12));
      setNowPlaying(nowPlayingData.slice(0, 12));
      setTopRated(topRatedData.slice(0, 12));
      setAiringToday(airingData.slice(0, 12));
      setOnTheAir(onAirData.slice(0, 12));
    };
    loadData();
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await movieApi.search(query);
    setSearchResults(results.slice(0, 24));
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  // Route to MovieDetail if hash matches
  if (hash.match(/^#\/(movie|tv)\/\d+/)) return <MovieDetail />;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      
      <main>
        <Hero onSearch={handleSearch} />

        <div id="content" className="max-w-7xl mx-auto px-6 space-y-24 pb-24 scroll-mt-32">
          {isSearching ? (
            <motion.section 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionVariants}
              className="space-y-8"
            >
              <div className="flex items-center justify-between border-l-4 border-primary pl-6">
                <div className="space-y-1">
                  <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                    <Sparkles className="text-primary w-8 h-8" />
                    Search Results
                  </h2>
                  <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                    Found {searchResults.length} matches
                  </p>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {searchResults.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8"
                  >
                    {searchResults.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 bg-[#14141f]/30 rounded-3xl border border-white/5"
                  >
                    <p className="text-white/40 font-medium text-lg">No results found for your search.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          ) : (
            <>
              {/* Category Filter */}
              <div className="flex items-center gap-4 border-b border-white/5 pb-8 overflow-x-auto no-scrollbar">
                {(['all', 'movies', 'tv'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeCategory === cat 
                        ? 'bg-primary text-white shadow-[0_10px_20px_rgba(229,9,20,0.3)]' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'All Content' : cat === 'movies' ? 'Movies' : 'TV Shows'}
                  </button>
                ))}
              </div>

              {(activeCategory === 'all' || activeCategory === 'movies') && (
                <motion.section 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={sectionVariants}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between border-l-4 border-primary pl-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                        <Sparkles className="text-primary w-8 h-8" />
                        New in 2026 - Must Watch
                      </h2>
                      <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                        Latest additions updated today
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                    {upcoming.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                    ))}
                  </div>
                </motion.section>
              )}

              {(activeCategory === 'all' || activeCategory === 'movies') && (
                <motion.section 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={sectionVariants}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between border-l-4 border-primary pl-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                        <TrendingUp className="text-primary w-8 h-8" />
                        Trending Movies
                      </h2>
                      <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                        What everyone is watching right now
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                    {trending.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                    ))}
                  </div>
                </motion.section>
              )}

              {(activeCategory === 'all' || activeCategory === 'movies') && (
                <motion.section 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={sectionVariants}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between border-l-4 border-primary pl-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                        <Film className="text-primary w-8 h-8" />
                        Now Playing
                      </h2>
                      <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                        Currently in theaters
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                    {nowPlaying.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                    ))}
                  </div>
                </motion.section>
              )}

              {(activeCategory === 'all' || activeCategory === 'movies') && (
                <motion.section 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={sectionVariants}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between border-l-4 border-primary pl-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                        <Star className="text-primary w-8 h-8" />
                        Top Rated Movies
                      </h2>
                      <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                        Critically acclaimed and fan favorites
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                    {topRated.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                    ))}
                  </div>
                </motion.section>
              )}

              {(activeCategory === 'all' || activeCategory === 'tv') && (
                <motion.section 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={sectionVariants}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between border-l-4 border-primary pl-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                        <Tv className="text-primary w-8 h-8" />
                        Top TV Shows
                      </h2>
                      <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                        Popular series and originals
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                    {popularTv.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                    ))}
                  </div>
                </motion.section>
              )}

              {(activeCategory === 'all' || activeCategory === 'tv') && (
                <motion.section 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={sectionVariants}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between border-l-4 border-primary pl-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                        <Clock className="text-primary w-8 h-8" />
                        Airing Today
                      </h2>
                      <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                        Fresh episodes available now
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                    {airingToday.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                    ))}
                  </div>
                </motion.section>
              )}

              {(activeCategory === 'all' || activeCategory === 'tv') && (
                <motion.section 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={sectionVariants}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between border-l-4 border-primary pl-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                        <Radio className="text-primary w-8 h-8" />
                        On The Air
                      </h2>
                      <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                        Currently broadcasting series
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                    {onTheAir.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                    ))}
                  </div>
                </motion.section>
              )}
            </>
          )}
        </div>

        <FAQ />
      </main>

      <Footer />

      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

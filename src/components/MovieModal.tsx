import { X, Play, Star, Calendar, Info, Download } from 'lucide-react';
import { Movie, movieApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

const VIDSRC_DOMAINS = [
  'vidsrc-embed.ru',
  'vidsrc-embed.su',
  'vidsrcme.su',
  'vsrc.su',
];

export function MovieModal({ movie, isOpen, onClose }: MovieModalProps) {
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeServer, setActiveServer] = useState<number>(1);
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);

  const isTV = (movie?.media_type === 'tv' || (!movie?.release_date && !!movie?.first_air_date));

  useEffect(() => {
    if (movie && isOpen) {
      const fetchTrailer = async () => {
        setIsLoading(true);
        const url = await movieApi.getVideos(movie.id, isTV ? 'tv' : 'movie');
        setTrailerUrl(url);
        setIsLoading(false);
      };
      fetchTrailer();
    } else {
      setTrailerUrl(null);
      setIsPlaying(false);
      setActiveServer(1);
      setSeason(1);
      setEpisode(1);
    }
  }, [movie, isOpen]);

  if (!movie) return null;

  const title = movie.title || movie.name || 'Untitled';
  const year = movie.release_date
    ? movie.release_date.split('-')[0]
    : movie.first_air_date
      ? movie.first_air_date.split('-')[0]
      : '2026';

  // Build embed URLs using the OFFICIAL vidsrc API format:
  //   Movie:  /embed/movie/{tmdb_id}
  //   TV:     /embed/tv/{tmdb_id}
  //   Episode:/embed/tv/{tmdb_id}/{season}-{episode}
  const getEmbedUrl = (server: number): string => {
    const tmdbId = movie.id;
    const domain = VIDSRC_DOMAINS[(server - 1) % VIDSRC_DOMAINS.length];

    switch (server) {
      // --- vidsrc official API (4 domains, auto-rotated) ---
      case 1:  // vidsrc-embed.ru
      case 2:  // vidsrc-embed.su
      case 3:  // vidsrcme.su
      case 4:  // vsrc.su
        if (isTV) {
          return `https://${domain}/embed/tv/${tmdbId}/${season}-${episode}`;
        }
        return `https://${domain}/embed/movie/${tmdbId}`;

      // --- vidsrc.to (widely used) ---
      case 5:
        return isTV
          ? `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`
          : `https://vidsrc.to/embed/movie/${tmdbId}`;

      // --- embed.su ---
      case 6:
        return isTV
          ? `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`
          : `https://embed.su/embed/movie/${tmdbId}`;

      // --- 2embed.cc ---
      case 7:
        return `https://www.2embed.cc/embed/${isTV ? 'tv' : 'movie'}?tmdb=${tmdbId}` + (isTV ? `&sea=${season}&epi=${episode}` : '');

      // --- moviesapi.club ---
      case 8:
        return `https://moviesapi.club/movie/${tmdbId}`;

      // --- multiembed.mov ---
      case 9:
        return `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1` + (isTV ? `&s=${season}&e=${episode}` : '');

      // --- autoembed.cc ---
      case 10:
        return `https://autoembed.cc/embed/${isTV ? 'tv' : 'movie'}/${tmdbId}`;

      default:
        return `https://vidsrc-embed.ru/embed/movie/${tmdbId}`;
    }
  };

  // Get server label for display
  const getServerLabel = (server: number): string => {
    switch (server) {
      case 1: return 'VidSrc #1 (.ru)';
      case 2: return 'VidSrc #2 (.su)';
      case 3: return 'VidSrc #3 (me.su)';
      case 4: return 'VidSrc #4 (vsrc)';
      case 5: return 'VidSrc.to';
      case 6: return 'Embed.su';
      case 7: return '2Embed';
      case 8: return 'MoviesAPI';
      case 9: return 'MultiEmbed';
      case 10: return 'AutoEmbed';
      default: return `Server ${server}`;
    }
  };

  const handleDownload = () => {
    const query = encodeURIComponent(title);
    window.open(`https://www.google.com/search?q=${query}+download+1080p`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-[#0a0a0f] border-white/5 text-white rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative group"
        >
          <div className="aspect-video bg-black relative">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] animate-pulse">
                    Fetching Trailer...
                  </p>
                </div>
              </div>
            ) : isPlaying ? (
              <div className="w-full h-full flex flex-col bg-black">
                <iframe
                  src={getEmbedUrl(activeServer)}
                  className="w-full flex-1"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
                  title={title}
                  frameBorder="0"
                  allowFullScreen
                  referrerPolicy="origin"
                />
                {/* Server bar */}
                <div className="bg-[#0f0f16] p-4 flex flex-col gap-3 border-t border-white/5">
                  {/* TV episode selector */}
                  {isTV && (
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Episode:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/30">S</span>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={season}
                          onChange={(e) => setSeason(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-14 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-primary"
                        />
                        <span className="text-white/20 text-xs">E</span>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={episode}
                          onChange={(e) => setEpisode(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-14 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => setActiveServer(prev => prev)}
                          className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors ml-2"
                        >
                          Reload
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Stream Servers</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                      {getServerLabel(activeServer)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                      <button
                        key={s}
                        onClick={() => setActiveServer(s)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${
                          activeServer === s
                            ? 'bg-primary text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] scale-105'
                            : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60'
                        }`}
                      >
                        {getServerLabel(s).split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : trailerUrl ? (
              <iframe
                src={`${trailerUrl}?autoplay=1&mute=0`}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                title={title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/40">
                <img
                  src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://placehold.co/1280x720/1a1a2e/e50914?text=Preview+Not+Available';
                  }}
                />
                <div className="relative z-10 text-center space-y-4">
                  <Play className="w-16 h-16 text-primary mx-auto opacity-80" />
                  <p className="text-white/60 font-medium px-6">
                    Trailer not available. Click Watch Now to play from our servers.
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-primary transition-all duration-300 shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-8 space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-black tracking-tight">{title}</h2>
              <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-white/40">
                <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4" />
                  <span>{year}</span>
                </div>
                <span>{isTV ? 'TV Series' : 'Movie'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsPlaying(true)}
                size="lg"
                className="rounded-full px-8 py-7 text-lg font-bold bg-primary hover:bg-primary/90 shadow-[0_10px_20px_rgba(229,9,20,0.3)] transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-5 h-5 mr-3 fill-current" />
                Watch Now Free
              </Button>
              <Button
                onClick={handleDownload}
                variant="secondary"
                size="lg"
                className="rounded-full px-8 py-7 text-lg font-bold bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-105 active:scale-95"
              >
                <Download className="w-5 h-5 mr-3" />
                Download
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-white/60">
              <Info className="w-4 h-4" />
              Overview
            </h4>
            <p className="text-white/60 leading-relaxed text-lg">
              {movie.overview || 'No overview available for this title.'}
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

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

export function MovieModal({ movie, isOpen, onClose }: MovieModalProps) {
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isTV = (movie?.media_type === 'tv' || (!movie?.release_date && !!movie?.first_air_date));

  useEffect(() => {
    if (movie && isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        const type = isTV ? 'tv' : 'movie';
        const [trailer, imdb] = await Promise.all([
          movieApi.getVideos(movie.id, type),
          movieApi.getImdbId(movie.id, type),
        ]);
        setTrailerUrl(trailer);
        setImdbId(imdb);
        setIsLoading(false);
      };
      fetchData();
    } else {
      setTrailerUrl(null);
      setImdbId(null);
    }
  }, [movie, isOpen]);

  if (!movie) return null;

  const title = movie.title || movie.name || 'Untitled';
  const year = movie.release_date
    ? movie.release_date.split('-')[0]
    : movie.first_air_date
      ? movie.first_air_date.split('-')[0]
      : '2026';

  const handleWatchNow = () => {
    onClose();
    // Navigate to standalone Watch page via hash — the iframe runs in its own
    // top-level context, avoiding the sandboxed-iframe-in-dialog problem.
    const vid = imdbId || movie.id;
    const type = isTV ? 'tv' : 'movie';
    const tvQS = isTV ? '?season=1&episode=1' : '';
    window.location.hash = `#/watch/${type}/${vid}${tvQS}`;
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
                    Loading details...
                  </p>
                </div>
              </div>
            ) : trailerUrl ? (
              <iframe
                src={`${trailerUrl}?autoplay=1&mute=0`}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                title={title}
                allowFullScreen
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
                    Watch the full movie with our streaming servers.
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
                {imdbId && (
                  <span className="text-white/20 text-[10px]">{imdbId}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleWatchNow}
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

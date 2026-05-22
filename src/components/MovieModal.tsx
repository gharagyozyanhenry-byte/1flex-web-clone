import { X, Play, Star, Calendar, Info, Download, Tv } from 'lucide-react';
import { Movie, movieApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MovieModal({ movie, isOpen, onClose }: MovieModalProps) {
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeServer, setActiveCategory] = useState<number>(1);

  useEffect(() => {
    if (movie && isOpen) {
      const fetchTrailer = async () => {
        setIsLoading(true);
        const url = await movieApi.getVideos(movie.id, movie.media_type || 'movie');
        setTrailerUrl(url);
        setIsLoading(false);
      };
      fetchTrailer();
    } else {
      setTrailerUrl(null);
      setIsPlaying(false);
      setActiveCategory(1);
    }
  }, [movie, isOpen]);

  if (!movie) return null;

  const title = movie.title || movie.name || 'Untitled';
  const year = movie.release_date ? movie.release_date.split('-')[0] : (movie.first_air_date ? movie.first_air_date.split('-')[0] : '2026');

  // Multi-server embed logic for better reliability
  const getEmbedUrl = (server: number) => {
    const type = movie.media_type === 'tv' ? 'tv' : 'movie';
    const id = movie.id;
    
    switch(server) {
      case 1: return `https://vidsrc.xyz/embed/${type}/${id}`;
      case 2: return `https://embed.su/embed/${type}/${id}`;
      case 3: return `https://vidsrc.to/embed/${type}/${id}`;
      default: return `https://vidsrc.xyz/embed/${type}/${id}`;
    }
  };

  const handleDownload = () => {
    window.open('https://netmovies-vo.storage.googleapis.com/index.html', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-[#14141f] border-white/10 text-white rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative group"
        >
          <div className="aspect-video bg-black relative">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-black/40">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : isPlaying ? (
              <div className="w-full h-full flex flex-col">
                <iframe
                  src={getEmbedUrl(activeServer)}
                  className="w-full flex-1"
                  allow="autoplay; fullscreen"
                  title={title}
                  frameBorder="0"
                />
                <div className="bg-black/80 p-2 flex items-center justify-center gap-4 border-t border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 mr-2">Switch Server:</span>
                  {[1, 2, 3].map((s) => (
                    <button
                      key={s}
                      onClick={() => setActiveCategory(s)}
                      className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                        activeServer === s ? 'bg-primary text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      Server {s}
                    </button>
                  ))}
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
                    e.currentTarget.src = 'https://placehold.co/1280x720/1a1a2e/e50914?text=Preview+Not+Available';
                  }}
                />
                <div className="relative z-10 text-center space-y-4">
                  <Play className="w-16 h-16 text-primary mx-auto opacity-80" />
                  <p className="text-white/60 font-medium px-6">Trailer not available. Click Watch Now to play from our servers.</p>
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
                <span>{movie.media_type === 'tv' ? 'TV Series' : 'Movie'}</span>
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

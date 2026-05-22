import { Calendar, Star, Film } from 'lucide-react';
import { Movie, IMAGE_BASE } from '@/lib/api';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const title = movie.title || movie.name || 'Untitled';
  const year = movie.release_date ? movie.release_date.split('-')[0] : (movie.first_air_date ? movie.first_air_date.split('-')[0] : '2026');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(movie)}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5 bg-[#1a1a2e] transition-all duration-500 group-hover:border-primary group-hover:shadow-[0_0_30px_rgba(229,9,20,0.3)]">
        {movie.poster_path && !imageError ? (
          <motion.img
            src={`${IMAGE_BASE}${movie.poster_path}`}
            alt={title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] text-white/20">
            <Film className="w-12 h-12 mb-2" />
            <span className="text-[10px] uppercase tracking-widest font-bold px-4 text-center">{title}</span>
          </div>
        )}
        
        {/* Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                  <Star className="w-3 h-3 fill-current" />
                  {movie.vote_average.toFixed(1)}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                  <Calendar className="w-3 h-3" />
                  {year}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 space-y-1 px-1">
        <h3 className="text-sm font-semibold text-white/90 truncate group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
          {movie.media_type === 'tv' ? 'TV Series' : 'Movie'} • {year}
        </p>
      </div>
    </motion.div>
  );
}

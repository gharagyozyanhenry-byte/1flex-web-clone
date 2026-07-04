import { useEffect } from 'react';
import { ArrowLeft, ExternalLink, Film } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  type: 'movie' | 'tv';
  tmdbId: string;
  season?: string;
  episode?: string;
  title?: string;
}

export function Watch({ type, tmdbId, season = '1', episode = '1', title }: Props) {
  const tvPath = type === 'tv' ? `/${season}/${episode}` : '';
  const vidkingUrl = `https://www.vidking.net/embed/${type}/${tmdbId}${tvPath}?color=e50914&autoPlay=true${type === 'tv' ? '&nextEpisode=true&episodeSelector=true' : ''}`;

  useEffect(() => {
    // Auto-open player in new tab after 500ms so the user sees our page first
    const timeout = setTimeout(() => {
      window.open(vidkingUrl, '_blank');
    }, 500);
    return () => clearTimeout(timeout);
  }, [vidkingUrl]);

  const handleBack = () => {
    window.location.hash = '';
  };

  const handleOpenManual = () => {
    window.open(vidkingUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Top bar */}
      <div className="h-14 shrink-0 bg-[#0a0a0f] border-b border-white/10 flex items-center px-4 gap-4 z-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to browsing</span>
        </button>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center gap-8 px-6"
      >
        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center"
        >
          <Film className="w-10 h-10 text-primary" />
        </motion.div>

        <div className="text-center space-y-2">
          {title && (
            <h2 className="text-white text-xl font-semibold">{title}</h2>
          )}
          <p className="text-white/60 text-sm">
            Video opened in a new tab. Close that tab to come back here.
          </p>
        </div>

        <button
          onClick={handleOpenManual}
          className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full transition-all hover:scale-105 shadow-lg shadow-primary/25"
        >
          <ExternalLink className="w-5 h-5" />
          Open Player Again
        </button>
      </motion.div>
    </div>
  );
}

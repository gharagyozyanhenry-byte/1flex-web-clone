import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  type: 'movie' | 'tv';
  tmdbId: string;
  season?: string;
  episode?: string;
  title?: string;
}

export function Watch({ type, tmdbId, season = '1', episode = '1', title }: Props) {
  const [iframeFailed, setIframeFailed] = useState(false);

  const tvPath = type === 'tv' ? `/${season}/${episode}` : '';
  const vidkingUrl = `https://www.vidking.net/embed/${type}/${tmdbId}${tvPath}?color=e50914&autoPlay=true${type === 'tv' ? '&nextEpisode=true&episodeSelector=true' : ''}`;

  useEffect(() => {
    // If iframe doesn't fire onLoad after 8 seconds, assume failure
    const timeout = setTimeout(() => {
      setIframeFailed(true);
    }, 8000);
    return () => clearTimeout(timeout);
  }, []);

  const handleIframeLoad = () => {
    // Iframe loaded successfully - clear the timeout
    setIframeFailed(false);
  };

  const handleBack = () => {
    window.location.hash = '';
  };

  const handleOpenDirect = () => {
    window.top.location.href = vidkingUrl;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar with back button */}
      <div className="h-14 shrink-0 bg-[#0a0a0f] border-b border-white/10 flex items-center px-4 gap-4 z-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">{title || 'Back'}</span>
        </button>
      </div>

      {/* Player area */}
      <div className="flex-1 relative bg-black">
        {!iframeFailed ? (
          <iframe
            src={vidkingUrl}
            onLoad={handleIframeLoad}
            onError={() => setIframeFailed(true)}
            className="absolute inset-0 w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={title || 'Video Player'}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0f] gap-6 px-6"
          >
            <p className="text-white/40 text-sm text-center max-w-md">
              The player couldn't be embedded due to sandbox restrictions.
            </p>
            <button
              onClick={handleOpenDirect}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full transition-all hover:scale-105"
            >
              <ExternalLink className="w-4 h-4" />
              Open Player
            </button>
            <p className="text-white/20 text-xs">Press browser back to return here</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

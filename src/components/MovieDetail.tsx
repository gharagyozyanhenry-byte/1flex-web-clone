import { useState, useEffect } from 'react';
import { movieApi, MovieDetail as MovieDetailType, CastMember, IMAGE_ORIGINAL, IMAGE_BASE, Movie } from '@/lib/api';
import { CommentSection } from '@/components/CommentSection';
import { CastRow } from '@/components/CastRow';
import { motion } from 'framer-motion';
import {
  Star, Play, Heart, ArrowLeft, Clock, AlertCircle, Film,
} from 'lucide-react';

function parseHash(hash: string): { type: 'movie' | 'tv'; id: number } | null {
  const match = hash.match(/^#\/(movie|tv)\/(\d+)/);
  if (!match) return null;
  return { type: match[1] as 'movie' | 'tv', id: Number(match[2]) };
}

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).getFullYear().toString();
}

export default function MovieDetail() {
  const hash = window.location.hash;
  const parsed = parseHash(hash);
  const type = parsed?.type ?? 'movie';
  const movieId = parsed?.id ?? 0;

  const [detail, setDetail] = useState<MovieDetailType | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [progress, setProgress] = useState<{ seconds: number; duration: number; updatedAt: string } | null>(null);

  useEffect(() => {
    if (!parsed) { setLoading(false); setError('Invalid movie URL'); return; }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [det, cred, sim] = await Promise.all([
          movieApi.getDetails(movieId, type),
          movieApi.getCredits(movieId, type),
          movieApi.getSimilar(movieId, type),
        ]);
        if (!det) { setError('Movie not found'); setLoading(false); return; }
        setDetail(det);
        setCast(cred);
        setSimilar(sim.slice(0, 6));
      } catch {
        setError('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };
    load();

    // Favorites
    const favs = JSON.parse(localStorage.getItem('1flex_favorites') || '{}');
    setIsFav(!!favs[`${type}_${movieId}`]);

    // Progress
    const raw = localStorage.getItem(`progress_${type}_${movieId}`);
    if (raw) {
      try { setProgress(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, [hash]);

  const toggleFav = () => {
    if (!parsed) return;
    const key = `${type}_${movieId}`;
    const favs = JSON.parse(localStorage.getItem('1flex_favorites') || '{}');
    if (favs[key]) {
      delete favs[key];
      setIsFav(false);
    } else {
      favs[key] = { id: movieId, type, title: detail?.title || detail?.name || '', poster: detail?.poster_path || '', addedAt: new Date().toISOString() };
      setIsFav(true);
    }
    localStorage.setItem('1flex_favorites', JSON.stringify(favs));
  };

  const handleWatch = (withProgress?: number) => {
    const tvPath = isTV ? '/1/1' : '';
    window.location.hash = `#/watch/${type}/${movieId}${tvPath}`;
  };

  const handleBack = () => { window.location.hash = ''; };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs animate-pulse">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // ── Error ──
  if (error || !detail) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 text-center px-6">
          <AlertCircle className="w-16 h-16 text-primary/60" />
          <h1 className="text-2xl font-black text-white">{error || 'Something went wrong'}</h1>
          <p className="text-white/40">The page you're looking for doesn't exist or failed to load.</p>
          <button onClick={handleBack} className="px-8 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-all">Go Back Home</button>
        </motion.div>
      </div>
    );
  }

  const title = detail.title || detail.name || 'Untitled';
  const year = formatDate(detail.release_date || detail.first_air_date);
  const isTV = type === 'tv';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ─── Backdrop Hero ─── */}
      <section className="relative w-full min-h-[60vh] md:min-h-[80vh] overflow-hidden">
        {detail.backdrop_path ? (
          <img src={`${IMAGE_ORIGINAL}${detail.backdrop_path}`} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="eager" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-transparent to-transparent" />

        <button onClick={handleBack} className="absolute top-6 left-6 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-primary transition-all duration-300" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-12 lg:p-16">
          <div className="max-w-5xl space-y-4 md:space-y-6">
            {detail.tagline && <p className="text-primary text-sm md:text-base font-semibold italic opacity-90">{detail.tagline}</p>}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">{title}</h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {detail.vote_average > 0 && (
                <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-full font-bold">
                  <Star className="w-4 h-4 fill-current" /><span>{detail.vote_average.toFixed(1)}</span>
                </div>
              )}
              {year && <span className="text-white/60 font-bold uppercase tracking-wider text-xs">{year}</span>}
              {detail.runtime ? (
                <span className="text-white/60 font-bold uppercase tracking-wider text-xs">{formatRuntime(detail.runtime)}</span>
              ) : isTV && detail.number_of_seasons ? (
                <span className="text-white/60 font-bold uppercase tracking-wider text-xs">
                  {detail.number_of_seasons} Season{detail.number_of_seasons > 1 ? 's' : ''}{detail.number_of_episodes ? ` • ${detail.number_of_episodes} Episodes` : ''}
                </span>
              ) : null}
              {detail.status && <span className="text-white/40 font-bold uppercase tracking-wider text-[10px] bg-white/5 px-2 py-1 rounded">{detail.status}</span>}
            </div>

            {/* Genres */}
            {detail.genres && detail.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {detail.genres.map((g) => (
                  <span key={g.id} className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-white/10 text-white/80 border border-white/10">{g.name}</span>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button onClick={() => handleWatch()} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-white font-bold text-sm md:text-base hover:bg-primary/90 shadow-[0_10px_20px_rgba(229,9,20,0.3)] transition-all hover:scale-105 active:scale-95">
                <Play className="w-5 h-5 fill-current" />Watch Now
              </button>
              {progress && (
                <button onClick={() => handleWatch(progress.seconds)} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/10 text-white font-bold text-sm md:text-base hover:bg-white/20 border border-white/10 transition-all hover:scale-105 active:scale-95">
                  <Clock className="w-5 h-5" />Continue Watching
                </button>
              )}
              <button onClick={toggleFav} className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 border ${isFav ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'}`}>
                <Heart className={`w-5 h-5 ${isFav ? 'fill-primary text-primary' : ''}`} />{isFav ? 'Saved' : 'Add to Favorites'}
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Content ─── */}
      <div className="max-w-5xl mx-auto px-6 pb-24 space-y-20">
        {/* Synopsis */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6 }} className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <span className="w-8 h-px bg-primary/50" />Synopsis
          </h2>
          <p className="text-white/70 leading-relaxed text-base md:text-lg max-w-3xl">
            {detail.overview || 'No overview available for this title.'}
          </p>
        </motion.section>

        {/* Cast */}
        {cast.length > 0 && <CastRow cast={cast} />}

        {/* Watch Progress */}
        {progress && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6 }} className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <span className="w-8 h-px bg-primary/50" />Your Progress
            </h2>
            <div className="bg-[#14141f]/50 rounded-2xl border border-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Watch progress</span>
                <span className="text-white font-bold">{Math.round((progress.seconds / Math.max(progress.duration, 1)) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(Math.round((progress.seconds / Math.max(progress.duration, 1)) * 100), 100)}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full bg-primary rounded-full" />
              </div>
              <button onClick={() => handleWatch(progress.seconds)} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all">
                <Play className="w-4 h-4 fill-current" />Continue Watching
              </button>
            </div>
          </motion.section>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6 }} className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <span className="w-8 h-px bg-primary/50" />More Like This
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {similar.map((m) => {
                const simTitle = m.title || m.name || 'Untitled';
                const simType = m.media_type || (m.first_air_date ? 'tv' : 'movie');
                return (
                  <motion.div key={m.id} whileHover={{ y: -6 }} onClick={() => { window.location.hash = `#/${simType}/${m.id}`; }} className="cursor-pointer group">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a2e] border border-white/5 mb-2.5 group-hover:border-primary transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(229,9,20,0.2)]">
                      {m.poster_path ? (
                        <img src={`${IMAGE_BASE}${m.poster_path}`} alt={simTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10"><Film className="w-8 h-8" /></div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-white/80 truncate group-hover:text-primary transition-colors">{simTitle}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
                      {simType === 'tv' ? 'TV' : 'Movie'}
                      {m.vote_average > 0 && <span className="ml-2 text-yellow-400">★ {m.vote_average.toFixed(1)}</span>}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Comments */}
        <CommentSection movieId={movieId} type={type} />

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="flex justify-center pt-8 border-t border-white/5">
          <button onClick={handleBack} className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 font-bold text-sm transition-all">
            <ArrowLeft className="w-4 h-4" />Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}

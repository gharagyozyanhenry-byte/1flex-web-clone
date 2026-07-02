import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';

// Vidking API: /embed/movie/{tmdbId} | /embed/tv/{tmdbId}/{season}/{episode}
const BASE = 'https://www.vidking.net/embed';
const APP_COLOR = 'e50914';
const API_KEY = 'e0b203e42e12587b6ce507b8aa452e8c';

function parseHash(): { type: 'movie' | 'tv'; tmdbId: string; season: string; episode: string } {
  const hash = window.location.hash;
  const match = hash.match(/^#\/watch\/(movie|tv)\/(\d+)/);
  if (!match) return { type: 'movie', tmdbId: '', season: '1', episode: '1' };
  const type = match[1] as 'movie' | 'tv';
  const tmdbId = match[2];
  const qs = hash.split('?')[1] || '';
  const params = new URLSearchParams(qs);
  return { type, tmdbId, season: params.get('season') || '1', episode: params.get('episode') || '1' };
}

export function Watch() {
  const { type, tmdbId, season: initS, episode: initE } = parseHash();
  const [season, setSeason] = useState(initS);
  const [episode, setEpisode] = useState(initE);
  const [title, setTitle] = useState('Loading...');

  const isTV = type === 'tv';
  const isSandboxed = window.self !== window.top;

  // Fetch title
  useEffect(() => {
    if (!tmdbId) return;
    (async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/${isTV ? 'tv' : 'movie'}/${tmdbId}?api_key=${API_KEY}&language=en-US`);
        const data = await res.json();
        setTitle(data.title || data.name || 'Untitled');
      } catch { setTitle('Untitled'); }
    })();
  }, [tmdbId, isTV]);

  // Build embed URL
  const embedUrl = useMemo(() => {
    if (!tmdbId) return '';
    let url = isTV ? `${BASE}/tv/${tmdbId}/${season}/${episode}` : `${BASE}/movie/${tmdbId}`;
    const params = new URLSearchParams();
    params.set('color', APP_COLOR);
    params.set('autoPlay', 'true');
    if (isTV) { params.set('nextEpisode', 'true'); params.set('episodeSelector', 'true'); }
    return `${url}?${params.toString()}`;
  }, [tmdbId, isTV, season, episode]);

  const iframeKey = `${tmdbId}-${season}-${episode}`;

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = '';
    }
  };

  // Build direct Vidking URL for sandboxed fallback
  const directUrl = useMemo(() => {
    if (!tmdbId) return '#';
    const tvPath = isTV ? `/${season}/${episode}` : '';
    return `https://www.vidking.net/embed/${type}/${tmdbId}${tvPath}?color=e50914&autoPlay=true${isTV ? '&nextEpisode=true&episodeSelector=true' : ''}`;
  }, [tmdbId, type, isTV, season, episode]);

  const handleOpenExternal = () => {
    window.top?.location.assign(directUrl);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ padding: '8px 16px', background: '#111', display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={handleBack} style={{ color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={16} /> Back
        </button>

        <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
          {title}
        </span>

        {isTV && !isSandboxed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
            <span style={{ color: '#666', fontSize: '11px' }}>S</span>
            <input type="number" min={1} max={50} value={season} onChange={(e) => setSeason(String(Math.max(1, parseInt(e.target.value) || 1)))}
              style={{ width: '42px', padding: '3px 4px', borderRadius: '4px', border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: '11px', textAlign: 'center', outline: 'none' }} />
            <span style={{ color: '#666', fontSize: '11px' }}>E</span>
            <input type="number" min={1} max={50} value={episode} onChange={(e) => setEpisode(String(Math.max(1, parseInt(e.target.value) || 1)))}
              style={{ width: '42px', padding: '3px 4px', borderRadius: '4px', border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: '11px', textAlign: 'center', outline: 'none' }} />
          </div>
        )}

        <span style={{ color: '#666', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: 'auto' }}>
          powered by Vidking
        </span>
      </div>

      {/* Player area */}
      <div style={{ flex: 1, position: 'relative', background: '#000' }}>
        {isSandboxed ? (
          /* Sandboxed (e.g. Blink preview): show fallback - open in top window */
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '24px' }}>
            <p style={{ color: '#999', fontSize: '14px', textAlign: 'center' }}>
              The player opens in a full browser window to avoid sandbox restrictions.
            </p>
            <button onClick={handleOpenExternal}
              style={{ background: '#E50914', color: '#fff', border: 'none', borderRadius: '999px', padding: '12px 32px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
              <ExternalLink size={18} /> Open Player
            </button>
            <p style={{ color: '#555', fontSize: '11px' }}>Press browser back to return here</p>
          </div>
        ) : (
          /* Production: no sandbox, iframe works fine */
          <iframe key={iframeKey} src={embedUrl}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allowFullScreen allow="autoplay; fullscreen; picture-in-picture; encrypted-media" />
        )}
      </div>
    </div>
  );
}
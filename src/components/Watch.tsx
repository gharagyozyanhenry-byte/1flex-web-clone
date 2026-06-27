import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { movieApi } from '@/lib/api';

const SERVERS = {
  movie: [
    (id: string) => `https://vsembed.ru/embed/movie/${id}`,
    (id: string) => `https://vidsrc-embed.ru/embed/movie/${id}`,
    (id: string) => `https://vsrc.su/embed/movie/${id}`,
    (id: string) => `https://vidsrc.to/embed/movie/${id}`,
    (id: string) => `https://embed.su/embed/movie/${id}`,
    (id: string) => `https://www.2embed.cc/embed/movie?tmdb=${id}`,
    (id: string) => `https://autoembed.cc/embed/movie/${id}`,
  ],
  tv: [
    (id: string, s: string, e: string) => `https://vsembed.ru/embed/tv/${id}/${s}-${e}`,
    (id: string, s: string, e: string) => `https://vidsrc-embed.ru/embed/tv/${id}/${s}-${e}`,
    (id: string, s: string, e: string) => `https://vsrc.su/embed/tv/${id}/${s}-${e}`,
    (id: string, s: string, e: string) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
    (id: string, s: string, e: string) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
    (id: string, s: string, e: string) => `https://www.2embed.cc/embed/tv?tmdb=${id}&sea=${s}&epi=${e}`,
    (id: string, s: string, e: string) => `https://autoembed.cc/embed/tv/${id}/${s}/${e}`,
  ],
};

function parseHash(): { type: 'movie' | 'tv'; id: string; season: string; episode: string } {
  const hash = window.location.hash;
  // Expected format: #/watch/movie/tt12345678
  //                 #/watch/tv/tt12345678?season=1&episode=1
  const match = hash.match(/^#\/watch\/(movie|tv)\/([^?]+)/);
  if (!match) return { type: 'movie', id: '', season: '1', episode: '1' };

  const type = match[1] as 'movie' | 'tv';
  const id = match[2];
  const query = hash.split('?')[1] || '';
  const params = new URLSearchParams(query);
  return {
    type,
    id,
    season: params.get('season') || '1',
    episode: params.get('episode') || '1',
  };
}

export function Watch() {
  const { type, id, season: initS, episode: initE } = parseHash();
  const [server, setServer] = useState(0);
  const [season, setSeason] = useState(initS);
  const [episode, setEpisode] = useState(initE);
  const [title, setTitle] = useState('Loading...');
  const [imdbId, setImdbId] = useState<string | null>(id.startsWith('tt') ? id : null);

  const isTV = type === 'tv';
  const numericId = id.replace(/^tt/, '');

  // Fetch IMDb ID if we only got a TMDB numeric ID via the hash
  useEffect(() => {
    if (imdbId) return;
    const fetchImdb = async () => {
      const tmdbNum = parseInt(numericId);
      if (isNaN(tmdbNum)) return;
      const imdb = await movieApi.getImdbId(tmdbNum, isTV ? 'tv' : 'movie');
      if (imdb) setImdbId(imdb);
    };
    fetchImdb();
  }, [numericId, isTV, imdbId]);

  // Fetch title
  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const tmdbNum = parseInt(numericId);
        if (isNaN(tmdbNum)) {
          if (imdbId) setTitle(imdbId);
          return;
        }
        const res = await fetch(
          `https://api.themoviedb.org/3/${isTV ? 'tv' : 'movie'}/${tmdbNum}?api_key=e0b203e42e12587b6ce507b8aa452e8c&language=en-US`,
        );
        const data = await res.json();
        setTitle(data.title || data.name || 'Untitled');
      } catch {
        setTitle('Untitled');
      }
    };
    fetchTitle();
  }, [numericId, isTV, imdbId]);

  const getUrl = useCallback(() => {
    const vid = imdbId || id;
    if (isTV) {
      return SERVERS.tv[server](vid, season, episode);
    }
    return SERVERS.movie[server](vid);
  }, [server, imdbId, id, isTV, season, episode]);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = '';
    }
  };

  const url = getUrl();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '8px 16px',
        background: '#111',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        <button
          onClick={handleBack}
          style={{
            color: '#aaa',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginRight: '16px',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <span style={{
          color: '#fff',
          fontSize: '13px',
          fontWeight: 700,
          marginRight: '12px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '200px',
        }}>
          {title}
        </span>

        {isTV && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '16px' }}>
            <span style={{ color: '#666', fontSize: '11px' }}>S</span>
            <input
              type="number"
              min={1}
              max={30}
              value={season}
              onChange={(e) => setSeason(String(Math.max(1, parseInt(e.target.value) || 1)))}
              style={{
                width: '40px',
                padding: '3px 4px',
                borderRadius: '4px',
                border: '1px solid #333',
                background: '#1a1a1a',
                color: '#fff',
                fontSize: '11px',
                textAlign: 'center',
                outline: 'none',
              }}
            />
            <span style={{ color: '#666', fontSize: '11px' }}>E</span>
            <input
              type="number"
              min={1}
              max={30}
              value={episode}
              onChange={(e) => setEpisode(String(Math.max(1, parseInt(e.target.value) || 1)))}
              style={{
                width: '40px',
                padding: '3px 4px',
                borderRadius: '4px',
                border: '1px solid #333',
                background: '#1a1a1a',
                color: '#fff',
                fontSize: '11px',
                textAlign: 'center',
                outline: 'none',
              }}
            />
          </div>
        )}

        {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'].map((label, i) => (
          <button
            key={i}
            onClick={() => setServer(i)}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: `1px solid ${i === server ? '#E50914' : '#333'}`,
              background: i === server ? '#E50914' : '#1a1a1a',
              color: i === server ? '#fff' : '#888',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* THE IFRAME — NO sandbox attribute */}
      <div style={{ flex: 1, position: 'relative', background: '#000' }}>
        <iframe
          key={`${server}-${season}-${episode}-${url}`}
          src={url}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        />
      </div>

      {/* Hint */}
      <div style={{
        padding: '6px 16px',
        background: '#0a0a0a',
        color: '#444',
        fontSize: '11px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        If the video doesn't load, try a different server above.
      </div>
    </div>
  );
}

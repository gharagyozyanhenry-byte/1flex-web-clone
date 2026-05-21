import { Film, ChevronRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#07070c] border-t border-white/10 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Film className="text-primary w-6 h-6" />
            <h4 className="text-xl font-bold text-white tracking-tight">1FLEX</h4>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            1flex is the ultimate streaming destination that lets you watch movies and series for free. 
            Enjoy the latest 2026 blockbusters, TV shows, anime, and originals in HD quality.
          </p>
        </div>

        <div>
          <h4 className="text-primary font-bold mb-6 text-sm uppercase tracking-widest">Popular Genres</h4>
          <ul className="space-y-3">
            {['Action & Adventure', 'Comedy & Romance', 'Horror & Thriller', 'Sci-Fi & Fantasy', 'Drama & Crime'].map((genre) => (
              <li key={genre} className="flex items-center gap-2 group cursor-pointer">
                <ChevronRight className="w-4 h-4 text-primary opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                <span className="text-white/50 text-sm group-hover:text-white transition-colors">{genre}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-primary font-bold mb-6 text-sm uppercase tracking-widest">Watch Free Movies Online</h4>
          <p className="text-white/50 text-sm leading-relaxed">
            Access thousands of free movies online: action, comedy, drama, horror, sci-fi, and romance. 
            1flex brings you the best free streaming library directly from the web.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center">
        <p className="text-white/30 text-[10px] uppercase tracking-[0.2em]">
          © 2026 1flex - Watch Movies & Series Free | Stream free movies online | All trademarks belong to their respective owners.
        </p>
      </div>
    </footer>
  );
}

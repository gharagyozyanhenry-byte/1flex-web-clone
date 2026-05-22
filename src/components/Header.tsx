import { Film, PlayCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 flex items-center justify-between',
        isScrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      )}
    >
      <div className="flex items-center gap-2 cursor-pointer group">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
          <Film className="text-white w-6 h-6" />
        </div>
        <div className="flex items-baseline">
          <h1 className="text-2xl font-extrabold tracking-tighter text-white">
            1FLEX
          </h1>
          <span className="ml-2 px-1.5 py-0.5 bg-primary text-[10px] font-bold text-white rounded uppercase tracking-wider">
            2026
          </span>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <a href="#" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">Home</a>
        <a href="#content" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">Movies</a>
        <a href="#content" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">TV Shows</a>
      </nav>

      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/10"
          onClick={() => window.scrollTo({ top: 100, behavior: 'smooth' })}
        >
          <Search className="w-5 h-5" />
        </Button>
        <Button 
          onClick={() => document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' })}
          className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white font-semibold flex gap-2 transition-all hover:scale-105"
        >
          <PlayCircle className="w-4 h-4" />
          Watch Free
        </Button>
      </div>
    </header>
  );
}

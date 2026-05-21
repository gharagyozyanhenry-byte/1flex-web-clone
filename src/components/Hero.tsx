import { Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion } from 'framer-motion';

interface HeroProps {
  onSearch: (query: string) => void;
}

export function Hero({ onSearch }: HeroProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center space-y-8 relative z-10"
      >
        <div className="space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight"
          >
            Watch <span className="text-primary">2026 Movies</span> & TV Shows Free
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto font-medium"
          >
            Stream the latest blockbusters, trending series, and classics in HD. 
            No signup required, zero ads.
          </motion.p>
        </div>

        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onSubmit={handleSubmit} 
          className="max-w-2xl mx-auto group"
        >
          <div className="relative flex items-center bg-[#111118]/80 backdrop-blur-xl rounded-full p-1.5 border border-white/10 shadow-2xl transition-all duration-300 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any movie or TV show..."
              className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-white/30 px-6 py-3 text-lg h-auto"
            />
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-3 font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </Button>
          </div>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 pt-4"
        >
          {['Latest Releases', 'Full HD', 'No Signup', 'Daily Updates'].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{feature}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

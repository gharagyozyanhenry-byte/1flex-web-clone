import { useState } from 'react';
import { CastMember, IMAGE_BASE } from '@/lib/api';
import { motion } from 'framer-motion';
import { User, ChevronLeft, ChevronRight } from 'lucide-react';

interface CastRowProps {
  cast: CastMember[];
}

export function CastRow({ cast }: CastRowProps) {
  const [scroll, setScroll] = useState(0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
          <span className="w-8 h-px bg-primary/50" />
          Cast
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScroll((s) => Math.max(0, s - 300))}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScroll((s) => s + 300)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-500"
          style={{ transform: `translateX(-${scroll}px)` }}
        >
          {cast.map((member) => (
            <div key={member.id} className="flex-shrink-0 w-[130px] group">
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a2e] border border-white/5 mb-3">
                {member.profile_path ? (
                  <img
                    src={`${IMAGE_BASE}${member.profile_path}`}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold text-white truncate">{member.name}</p>
              <p className="text-xs text-white/40 truncate">{member.character}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

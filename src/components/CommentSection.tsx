import { useState, useEffect, useCallback } from 'react';
import { useBlink } from '@blinkdotnew/react';
import { motion } from 'framer-motion';
import { User, Send, Loader2 } from 'lucide-react';

interface Comment {
  id: string;
  movie_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  movieId: number;
  type: 'movie' | 'tv';
}

export function CommentSection({ movieId, type }: CommentSectionProps) {
  const { client } = useBlink();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const table = client.db.table<Comment>('comments');
      const rows = await table.list({
        where: { movie_id: `${type}_${movieId}` },
        orderBy: { created_at: 'desc' },
      });
      setComments(rows);
    } catch {
      // graceful
    } finally {
      setLoading(false);
    }
  }, [client, movieId, type]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setSubmitting(true);
    try {
      const table = client.db.table<Comment>('comments');
      await table.create({
        movie_id: `${type}_${movieId}`,
        user_name: commentName.trim() || 'Anonymous',
        content: commentContent.trim(),
        created_at: new Date().toISOString(),
      });
      setCommentName('');
      setCommentContent('');
      await loadComments();
    } catch {
      // fail silently
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
        <span className="w-8 h-px bg-primary/50" />
        Comments
        {comments.length > 0 && (
          <span className="text-white/40 text-xs ml-2">({comments.length})</span>
        )}
      </h2>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={commentName}
          onChange={(e) => setCommentName(e.target.value)}
          placeholder="Your name (optional)"
          maxLength={50}
          className="w-full px-4 py-3 bg-[#14141f] border border-white/10 rounded-xl text-white placeholder:text-white/30 text-sm outline-none focus:border-primary/50 transition-all"
        />
        <div className="flex gap-3">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            maxLength={500}
            className="flex-1 px-4 py-3 bg-[#14141f] border border-white/10 rounded-xl text-white placeholder:text-white/30 text-sm outline-none focus:border-primary/50 transition-all resize-none"
          />
          <button
            type="submit"
            disabled={!commentContent.trim() || submitting}
            className="self-end px-5 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="text-center py-8 bg-[#14141f]/30 rounded-2xl border border-white/5">
            <p className="text-white/30 text-sm">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}

        {comments.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#14141f]/50 rounded-xl border border-white/5 p-4 space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{c.user_name || 'Anonymous'}</p>
                <p className="text-[10px] text-white/30">
                  {new Date(c.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{c.content}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

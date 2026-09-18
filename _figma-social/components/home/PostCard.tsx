import { Heart, MessageCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Post {
  id: string;
  authorName: string;
  authorInitial: string;
  authorYear: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isQuestion: boolean;
  isLiked: boolean;
}

interface PostCardProps {
  post: Post;
  onPostClick: () => void;
  onAuthorClick: () => void;
  onLike: () => void;
}

export function PostCard({ post, onPostClick, onAuthorClick, onLike }: PostCardProps) {
  return (
    <div 
      className={`p-5 rounded-xl border-2 transition-all ${
        post.isQuestion
          ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
          : 'border-border bg-card hover:border-border/80'
      }`}
    >
      {/* Question Badge */}
      {post.isQuestion && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 mb-3">
          <AlertCircle className="w-4 h-4 text-primary" />
          <span className="text-primary" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}>
            QUESTION
          </span>
        </div>
      )}

      {/* Author Info */}
      <button
        onClick={onAuthorClick}
        className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity"
      >
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
          style={{ fontWeight: 'var(--font-weight-semibold)' }}
        >
          {post.authorInitial}
        </div>
        <div className="text-left">
          <p style={{ fontWeight: 'var(--font-weight-semibold)' }}>{post.authorName}</p>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            {post.authorYear} • {post.timestamp}
          </p>
        </div>
      </button>

      {/* Content */}
      <button
        onClick={onPostClick}
        className="w-full text-left mb-4 hover:opacity-90 transition-opacity"
      >
        <p style={{ lineHeight: '1.6' }}>{post.content}</p>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-6 pt-3 border-t border-border">
        <motion.button
          onClick={onLike}
          className={`flex items-center gap-2 transition-colors ${
            post.isLiked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          whileTap={{ scale: 0.9 }}
        >
          <Heart 
            className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`}
          />
          <span style={{ fontSize: 'var(--text-sm)' }}>{post.likes}</span>
        </motion.button>

        <button
          onClick={onPostClick}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span style={{ fontSize: 'var(--text-sm)' }}>{post.comments}</span>
        </button>
      </div>
    </div>
  );
}

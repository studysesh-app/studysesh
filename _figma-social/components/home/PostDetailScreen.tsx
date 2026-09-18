import { useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Send } from 'lucide-react';

interface Comment {
  id: string;
  authorName: string;
  authorInitial: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface PostDetailScreenProps {
  post: {
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
  };
  onBack: () => void;
  onLike: () => void;
}

const mockComments: Comment[] = [
  {
    id: '1',
    authorName: 'Alex Kim',
    authorInitial: 'A',
    content: 'I can send you my notes! DM me',
    timestamp: '1h ago',
    likes: 2,
    isLiked: false,
  },
  {
    id: '2',
    authorName: 'Jordan Lee',
    authorInitial: 'J',
    content: 'Same here, would love to get those notes!',
    timestamp: '45m ago',
    likes: 1,
    isLiked: false,
  },
];

export function PostDetailScreen({ post, onBack, onLike }: PostDetailScreenProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [commentText, setCommentText] = useState('');

  const handlePostComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      authorName: 'You',
      authorInitial: 'Y',
      content: commentText,
      timestamp: 'Just now',
      likes: 0,
      isLiked: false,
    };

    setComments([...comments, newComment]);
    setCommentText('');
  };

  const handleLikeComment = (commentId: string) => {
    setComments(comments.map(comment =>
      comment.id === commentId
        ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
        : comment
    ));
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 pt-12 pb-4 border-b border-border bg-background sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2>Post</h2>
      </div>

      {/* Main Post */}
      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-border">
          <div className="p-4">
            {/* Author Info */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {post.authorInitial}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="truncate">{post.authorName}</h3>
                  {post.isQuestion && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary" style={{ fontSize: 'var(--text-xs)' }}>
                      Question
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  {post.authorYear} • {post.timestamp}
                </p>
              </div>
              <button className="p-2 hover:bg-muted rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Post Content */}
            <p className="mb-4" style={{ fontSize: 'var(--text-lg)', lineHeight: '1.5' }}>
              {post.content}
            </p>

            {/* Engagement Stats */}
            <div className="flex items-center gap-4 py-3 border-t border-b border-border text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              <span>{post.likes} likes</span>
              <span>{comments.length} comments</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-around py-2">
              <button
                onClick={onLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full hover:bg-muted transition-all ${
                  post.isLiked ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                <span style={{ fontSize: 'var(--text-sm)' }}>Like</span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-muted text-muted-foreground transition-all">
                <MessageCircle className="w-5 h-5" />
                <span style={{ fontSize: 'var(--text-sm)' }}>Comment</span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-muted text-muted-foreground transition-all">
                <Bookmark className="w-5 h-5" />
                <span style={{ fontSize: 'var(--text-sm)' }}>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="px-4 py-4">
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {comment.authorInitial}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted/50 rounded-2xl px-4 py-3 mb-1">
                      <h4 className="mb-1" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {comment.authorName}
                      </h4>
                      <p>{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-4 px-2">
                      <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                        {comment.timestamp}
                      </span>
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          comment.isLiked ? 'text-primary' : 'text-muted-foreground'
                        }`}
                        style={{ fontSize: 'var(--text-xs)' }}
                      >
                        <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                        {comment.likes > 0 && <span>{comment.likes}</span>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>

      {/* Comment Input */}
      <div className="border-t border-border bg-background p-4 pb-6">
        <div className="flex items-end gap-2">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
              Y
            </span>
          </div>
          <div className="flex-1 flex items-end gap-2 px-4 py-2 rounded-full bg-muted">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-transparent outline-none resize-none"
              rows={1}
              maxLength={280}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
            <button
              onClick={handlePostComment}
              disabled={!commentText.trim()}
              className="p-2 rounded-full bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

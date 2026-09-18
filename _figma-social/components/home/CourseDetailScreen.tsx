import { useState } from 'react';
import { ArrowLeft, Image, Link, Send, Heart, MessageCircle, HelpCircle } from 'lucide-react';
import { PostCard } from './PostCard';
import { Tabs } from '../Tabs';
import { TutorCard } from '../TutorCard';

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

interface CourseDetailScreenProps {
  courseName: string;
  onBack: () => void;
  onPostClick: (postId: string) => void;
  onAuthorClick: (authorId: string) => void;
  onTutorsClick: () => void;
}

const mockPosts: Post[] = [
  {
    id: '1',
    authorName: 'Sarah Chen',
    authorInitial: 'S',
    authorYear: '4th Year',
    content: 'Does anyone have notes from today\'s lecture? I had to leave early for an appointment.',
    timestamp: '2h ago',
    likes: 5,
    comments: 3,
    isQuestion: false,
    isLiked: false,
  },
  {
    id: '2',
    authorName: 'Marcus Johnson',
    authorInitial: 'M',
    authorYear: '3rd Year',
    content: 'Can someone explain how pointers work in C? I\'m really struggling with the assignment. 😭',
    timestamp: '4h ago',
    likes: 12,
    comments: 8,
    isQuestion: true,
    isLiked: true,
  },
  {
    id: '3',
    authorName: 'Emily Rodriguez',
    authorInitial: 'E',
    authorYear: '2nd Year',
    content: 'Study group meeting tomorrow at 2pm in the library! DM me if you want to join. We\'ll be going over Chapter 5.',
    timestamp: 'Yesterday',
    likes: 18,
    comments: 5,
    isQuestion: false,
    isLiked: false,
  },
];

export function CourseDetailScreen({
  courseName,
  onBack,
  onPostClick,
  onAuthorClick,
  onTutorsClick,
}: CourseDetailScreenProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [postContent, setPostContent] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const handlePost = () => {
    if (!postContent.trim()) return;
    
    const newPost: Post = {
      id: Date.now().toString(),
      authorName: 'You',
      authorInitial: 'Y',
      authorYear: '3rd Year',
      content: postContent,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      isQuestion,
      isLiked: false,
    };
    
    setPosts([newPost, ...posts]);
    setPostContent('');
    setIsQuestion(false);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 pt-12 pb-4 bg-background">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2>{courseName}</h2>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 pt-2 pb-4 bg-background">
        <Tabs
          tabs={[
            { id: 'board', title: 'The Board', content: null },
            { id: 'tutors', title: 'Tutors', content: null },
          ]}
          activeTabIndex={activeTab}
          onTabChange={setActiveTab}
          variant="pill"
        />
      </div>

      {activeTab === 0 ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Post Composer */}
          <div className="px-4 py-4 border-b border-border bg-card">
            <div className="p-4 rounded-xl bg-background border border-border">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share with your classmates..."
                className="w-full bg-transparent outline-none resize-none mb-3"
                rows={3}
                maxLength={500}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    title="Add image"
                  >
                    <Image className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    title="Add link"
                  >
                    <Link className="w-5 h-5 text-muted-foreground" />
                  </button>
                  
                  <div className="h-6 w-px bg-border mx-2" />
                  
                  <button
                    type="button"
                    onClick={() => setIsQuestion(!isQuestion)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                      isQuestion 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Question</span>
                  </button>
                </div>
                
                <button
                  onClick={handlePost}
                  disabled={!postContent.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  <Send className="w-4 h-4" />
                  Post
                </button>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostClick={() => onPostClick(post.id)}
                  onAuthorClick={() => onAuthorClick(post.id)}
                  onLike={() => handleLike(post.id)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
          <div className="space-y-4">
            <TutorCard
              name="Marcus Johnson"
              pronouns="he/him"
              courses={[courseName, 'MATH 1004']}
              groupPrice="$25"
              individualPrice="$35"
              location={['Online', 'In-Person']}
              nextAvailable="Today, 3 PM"
              onClick={() => console.log('Tutor clicked')}
            />
            <TutorCard
              name="Sarah Chen"
              pronouns="she/her"
              courses={[courseName, 'COMP 1406']}
              groupPrice="$20"
              individualPrice="$30"
              location={['Online']}
              nextAvailable="Tomorrow, 10 AM"
              onClick={() => console.log('Tutor clicked')}
            />
          </div>
        </div>
      )}
    </div>
  );
}
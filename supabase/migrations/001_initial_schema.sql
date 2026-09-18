-- ============================================================
-- studysesh: Initial Database Schema
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.users (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT UNIQUE NOT NULL,
  phone             TEXT,
  name              TEXT NOT NULL,
  pronouns          TEXT[],                          -- ['He', 'Him']
  gender            TEXT NOT NULL,                   -- 'Man' | 'Woman' | 'Non-Binary' | 'Prefer not to say'
  year              TEXT,                            -- '2nd Year'
  degree_level      TEXT,                            -- "Bachelor's"
  major             TEXT,                            -- 'Computer Science'
  bio               TEXT,
  photo_url         TEXT,
  status            TEXT DEFAULT 'Studying',         -- editable status badge
  profile_visibility TEXT DEFAULT 'everyone',        -- 'everyone' | 'women-nb-only'
  is_tutor          BOOLEAN DEFAULT FALSE,
  theme             TEXT DEFAULT 'light',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- User prompts (profile personality Q&A)
CREATE TABLE public.user_prompts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE,
  prompt     TEXT NOT NULL,
  answer     TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  UNIQUE(user_id, sort_order)
);

-- Courses (pre-seeded from Carleton calendar)
CREATE TABLE public.courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- User course enrollment (student)
CREATE TABLE public.user_courses (
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE,
  course_id  UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, course_id)
);

-- Tutor course applications
CREATE TABLE public.tutor_courses (
  user_id          UUID REFERENCES public.users(id) ON DELETE CASCADE,
  course_id        UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  group_price      DECIMAL,
  individual_price DECIMAL,
  session_type     TEXT DEFAULT 'both',              -- 'online' | 'in-person' | 'both'
  is_approved      BOOLEAN DEFAULT TRUE,             -- auto-approve per spec
  proof_url        TEXT,
  PRIMARY KEY (user_id, course_id)
);

-- Connections (friend requests)
CREATE TABLE public.connections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id  UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status       TEXT DEFAULT 'pending',               -- 'pending' | 'accepted' | 'declined'
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);

-- Blocked users
CREATE TABLE public.blocked_users (
  blocker_id  UUID REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id  UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- Board posts
CREATE TABLE public.posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   UUID REFERENCES public.users(id) ON DELETE CASCADE,
  course_id   UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  type        TEXT DEFAULT 'post',                   -- 'post' | 'question'
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Post likes
CREATE TABLE public.post_likes (
  user_id  UUID REFERENCES public.users(id) ON DELETE CASCADE,
  post_id  UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, post_id)
);

-- Comments
CREATE TABLE public.comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id  UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  parent_id  UUID REFERENCES public.comments(id),    -- for nested replies
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comment likes
CREATE TABLE public.comment_likes (
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, comment_id)
);

-- Conversations (DMs)
CREATE TABLE public.conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Conversation participants
CREATE TABLE public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

-- Messages
CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  status          TEXT DEFAULT 'sent',               -- 'sent' | 'delivered' | 'read'
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Activity feed / notifications
CREATE TABLE public.activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.users(id) ON DELETE CASCADE,
  actor_id     UUID REFERENCES public.users(id),
  type         TEXT NOT NULL,                        -- 'connection_request' | 'connection_accepted' | 'message' | 'board_like' | 'board_reply'
  reference_id UUID,
  course_code  TEXT,
  is_read      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- 2. INDEXES (for performance)
-- ============================================================

CREATE INDEX idx_user_courses_user ON public.user_courses(user_id);
CREATE INDEX idx_user_courses_course ON public.user_courses(course_id);
CREATE INDEX idx_tutor_courses_course ON public.tutor_courses(course_id);
CREATE INDEX idx_posts_course ON public.posts(course_id);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created ON public.messages(created_at);
CREATE INDEX idx_activities_user ON public.activities(user_id);
CREATE INDEX idx_activities_created ON public.activities(created_at DESC);
CREATE INDEX idx_connections_requester ON public.connections(requester_id);
CREATE INDEX idx_connections_receiver ON public.connections(receiver_id);
CREATE INDEX idx_blocked_blocker ON public.blocked_users(blocker_id);
CREATE INDEX idx_blocked_blocked ON public.blocked_users(blocked_id);
CREATE INDEX idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_courses_code ON public.courses(code);


-- ============================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 4. RLS POLICIES
-- ============================================================

-- ---- USERS ----

-- Users can view profiles with gender-based visibility rules
CREATE POLICY "users_select" ON public.users FOR SELECT USING (
  id = auth.uid()
  OR profile_visibility = 'everyone'
  OR (
    profile_visibility = 'women-nb-only'
    AND (SELECT gender FROM public.users WHERE id = auth.uid()) IN ('Woman', 'Non-Binary')
  )
);

-- Users can insert their own profile (on sign-up)
CREATE POLICY "users_insert" ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

-- Users can update only their own profile
CREATE POLICY "users_update" ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Users can delete only their own profile
CREATE POLICY "users_delete" ON public.users FOR DELETE
  USING (id = auth.uid());


-- ---- USER PROMPTS ----

CREATE POLICY "prompts_select" ON public.user_prompts FOR SELECT USING (
  -- Can see prompts for any profile you can see (handled by users RLS)
  EXISTS (SELECT 1 FROM public.users WHERE id = user_prompts.user_id)
);

CREATE POLICY "prompts_insert" ON public.user_prompts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "prompts_update" ON public.user_prompts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "prompts_delete" ON public.user_prompts FOR DELETE
  USING (user_id = auth.uid());


-- ---- COURSES ----

-- Everyone can read courses
CREATE POLICY "courses_select" ON public.courses FOR SELECT
  USING (true);


-- ---- USER COURSES ----

CREATE POLICY "user_courses_select" ON public.user_courses FOR SELECT
  USING (true);  -- anyone can see who's enrolled (needed for classmate matching)

CREATE POLICY "user_courses_insert" ON public.user_courses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_courses_delete" ON public.user_courses FOR DELETE
  USING (user_id = auth.uid());


-- ---- TUTOR COURSES ----

CREATE POLICY "tutor_courses_select" ON public.tutor_courses FOR SELECT
  USING (true);  -- anyone can see tutor listings

CREATE POLICY "tutor_courses_insert" ON public.tutor_courses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tutor_courses_update" ON public.tutor_courses FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "tutor_courses_delete" ON public.tutor_courses FOR DELETE
  USING (user_id = auth.uid());


-- ---- CONNECTIONS ----

CREATE POLICY "connections_select" ON public.connections FOR SELECT USING (
  requester_id = auth.uid() OR receiver_id = auth.uid()
);

CREATE POLICY "connections_insert" ON public.connections FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "connections_update" ON public.connections FOR UPDATE USING (
  -- Requester can cancel; receiver can accept/decline
  requester_id = auth.uid() OR receiver_id = auth.uid()
);

CREATE POLICY "connections_delete" ON public.connections FOR DELETE USING (
  requester_id = auth.uid() OR receiver_id = auth.uid()
);


-- ---- BLOCKED USERS ----

CREATE POLICY "blocked_select" ON public.blocked_users FOR SELECT
  USING (blocker_id = auth.uid());

CREATE POLICY "blocked_insert" ON public.blocked_users FOR INSERT
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "blocked_delete" ON public.blocked_users FOR DELETE
  USING (blocker_id = auth.uid());


-- ---- POSTS ----

CREATE POLICY "posts_select" ON public.posts FOR SELECT USING (
  -- Can see posts unless you've blocked the author or they've blocked you
  NOT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (blocker_id = auth.uid() AND blocked_id = posts.author_id)
       OR (blocker_id = posts.author_id AND blocked_id = auth.uid())
  )
);

CREATE POLICY "posts_insert" ON public.posts FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "posts_delete" ON public.posts FOR DELETE
  USING (author_id = auth.uid());


-- ---- POST LIKES ----

CREATE POLICY "post_likes_select" ON public.post_likes FOR SELECT
  USING (true);

CREATE POLICY "post_likes_insert" ON public.post_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "post_likes_delete" ON public.post_likes FOR DELETE
  USING (user_id = auth.uid());


-- ---- COMMENTS ----

CREATE POLICY "comments_select" ON public.comments FOR SELECT USING (
  NOT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (blocker_id = auth.uid() AND blocked_id = comments.author_id)
       OR (blocker_id = comments.author_id AND blocked_id = auth.uid())
  )
);

CREATE POLICY "comments_insert" ON public.comments FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "comments_delete" ON public.comments FOR DELETE
  USING (author_id = auth.uid());


-- ---- COMMENT LIKES ----

CREATE POLICY "comment_likes_select" ON public.comment_likes FOR SELECT
  USING (true);

CREATE POLICY "comment_likes_insert" ON public.comment_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "comment_likes_delete" ON public.comment_likes FOR DELETE
  USING (user_id = auth.uid());


-- ---- CONVERSATIONS ----

CREATE POLICY "conversations_select" ON public.conversations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversations.id AND user_id = auth.uid()
  )
);

CREATE POLICY "conversations_insert" ON public.conversations FOR INSERT
  WITH CHECK (true);  -- conversations created via edge function

CREATE POLICY "conversations_update" ON public.conversations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversations.id AND user_id = auth.uid()
  )
);


-- ---- CONVERSATION PARTICIPANTS ----

CREATE POLICY "conv_participants_select" ON public.conversation_participants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "conv_participants_insert" ON public.conversation_participants FOR INSERT
  WITH CHECK (true);  -- managed via edge function

CREATE POLICY "conv_participants_delete" ON public.conversation_participants FOR DELETE
  USING (user_id = auth.uid());  -- user can leave a conversation


-- ---- MESSAGES ----

CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "messages_update" ON public.messages FOR UPDATE USING (
  -- Only for marking messages as read (recipient can update status)
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);


-- ---- ACTIVITIES ----

CREATE POLICY "activities_select" ON public.activities FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "activities_insert" ON public.activities FOR INSERT
  WITH CHECK (true);  -- system/edge functions create activities

CREATE POLICY "activities_update" ON public.activities FOR UPDATE
  USING (user_id = auth.uid());  -- user can mark as read


-- ============================================================
-- 5. HELPER FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 6. STORAGE BUCKETS
-- ============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('proofs', 'proofs', false);

-- Storage policies: avatars (public read, owner write)
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_owner_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_owner_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies: proofs (owner read/write only — admin reviews via dashboard)
CREATE POLICY "proofs_owner_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "proofs_owner_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "proofs_owner_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "proofs_owner_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ============================================================
-- 7. REALTIME (enable for tables that need live updates)
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;

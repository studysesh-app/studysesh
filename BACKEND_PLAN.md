# studysesh Backend Plan

> Everything needed to take the frontend from mock data → real data.
> Written as a reference doc for you (Kshitij) and me (Cursor) to execute against.

---

## Table of Contents

1. [Tech Stack Decision](#1-tech-stack-decision)
2. [Decisions](#2-decisions-answered)
3. [Data Models](#3-data-models)
4. [API Endpoints](#4-api-endpoints)
5. [Real-Time Features](#5-real-time-features)
6. [Auth Flow](#6-auth-flow)
7. [File Storage](#7-file-storage)
8. [Privacy & Gender-Based Visibility](#8-privacy--gender-based-visibility)
9. [Phase Plan](#9-phase-plan)
10. [Frontend Integration Checklist](#10-frontend-integration-checklist)
11. [Infrastructure & Deployment](#11-infrastructure--deployment)

---

## 1. Tech Stack Decision

### Recommended: **Supabase** (hosted Postgres + Auth + Realtime + Storage)

| Why Supabase | Why NOT Firebase |
|---|---|
| Postgres = relational data (connections, courses, posts) fit naturally | Firestore's NoSQL makes relational queries painful |
| Built-in Row Level Security (RLS) = gender-based visibility rules at DB level | Firebase rules are powerful but harder to reason about for complex privacy |
| Built-in Realtime subscriptions for chat & activity | Firebase Realtime DB is separate from Firestore |
| Built-in Auth with email/password + phone OTP | Firebase Auth is comparable |
| Built-in Storage for profile photos & tutor proof uploads | Firebase Storage is comparable |
| Free tier is generous (500MB DB, 1GB storage, 50K monthly active users) | Firebase free tier is also decent |
| SQL = easy to query, debug, and migrate | NoSQL lock-in |

### API Layer: **Supabase Client SDK** (direct from React Native) + **Edge Functions** (for complex logic)

Instead of building a separate FastAPI server, we use:
- **Supabase JS Client** → direct DB reads/writes from the app (protected by RLS)
- **Supabase Edge Functions** (Deno/TypeScript) → for complex logic like:
  - Sending verification emails/SMS
  - Processing tutor proof uploads
  - Push notifications
  - Connection request logic with notification creation

This eliminates the need for a separate server, hosting, CORS config, etc. If we later need a dedicated API (e.g., for admin dashboard), we can add FastAPI then.

### Alternative: **FastAPI + Supabase**

If you prefer a traditional API layer:
- FastAPI handles all business logic
- Supabase is still the DB/Auth/Storage provider
- More control, but more infra to manage

**→ My recommendation: Start with Supabase-only. Add FastAPI later if needed.**

---

## 2. Decisions (Answered)

| # | Question | Answer |
|---|----------|--------|
| 1 | **Supabase project** | Kshitij will create and share URL + anon key |
| 2 | **University email domain** | `@cmail.carleton.ca` strictly enforced on sign-up |
| 3 | **Verification method** | **Email OTP** (Supabase built-in, free). SMS costs ~$0.01/text via Twilio. Email is $0 and Supabase handles it natively. Can add SMS fallback later if students complain about Outlook. |
| 4 | **Course list** | Extracted **3,808 courses across 113 departments** from Carleton 2025-26 calendar into `courses.json`. Pre-seeded into DB. |
| 5 | **Push notifications** | **Expo Push Notifications** - free, works on iOS App Store + Google Play, already integrated with Expo. |
| 6 | **Custom domain** | Later - not blocking |
| 7 | **App name** | **studysesh** |
| 8 | **Legal text** | Generating placeholder legal text for Privacy Policy and Terms of Service screens |
| 9 | **Tutor verification** | **Auto-approve on upload**. Proof files accessible to admin (Kshitij). If fake, manually delete their account. |
| 10 | **Payment processing** | **None** - pricing is display-only. Students and tutors handle payment independently (e-transfer etc.) |

### Supabase Project

- **Old project:** `https://bexahpvyagvssdykczvs.supabase.co` — paused ~Mar 2026 for inactivity.
  Free-tier projects can only be restored within 90 days of pausing, so it is presumed
  unrecoverable. Nothing of value was lost (test data only); the full schema + course seed
  live in `supabase/migrations/`.
- **Next:** create a fresh project → run `001_initial_schema.sql` then `002_seed_courses.sql`
  in the SQL Editor → put the new URL + anon key in `.env` → set `EXPO_PUBLIC_DEMO_MODE=false`.
- **Anti-pause:** free projects pause after ~7 days of no API activity. During slow dev weeks,
  open the dashboard or run any query to keep it alive (or set up a weekly keep-alive ping /
  upgrade to Pro at launch).

### Demo Mode (added Aug 2026)

`EXPO_PUBLIC_DEMO_MODE=true` in `.env` runs the app fully offline: any email/password/OTP
works, and course search uses the local `courses.json`. Implemented in `lib/demo.ts`,
`hooks/useAuth.ts`, and `components/profile/CourseInputModal.tsx`. This is how to demo/tweak
the frontend without touching Supabase. Flip to `false` to exercise the real backend
(restart with `npx expo start -c` after changing).

---

## 3. Data Models

### `users`
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  name          TEXT NOT NULL,
  pronouns      TEXT[],            -- ['He', 'Him']
  gender        TEXT NOT NULL,      -- 'Man' | 'Woman' | 'Non-Binary' | 'Prefer not to say'
  year          TEXT,               -- '2nd Year'
  degree_level  TEXT,               -- "Bachelor's"
  major         TEXT,               -- 'Computer Science'
  bio           TEXT,
  photo_url     TEXT,
  status        TEXT DEFAULT 'Studying',  -- editable status badge
  profile_visibility TEXT DEFAULT 'everyone', -- 'everyone' | 'women-nb-only'
  is_tutor      BOOLEAN DEFAULT FALSE,
  theme         TEXT DEFAULT 'light',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

### `user_prompts`
```sql
CREATE TABLE user_prompts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  prompt     TEXT NOT NULL,        -- "I study best at..."
  answer     TEXT NOT NULL,        -- "Late night in MacOdrum Library"
  sort_order INT DEFAULT 0,
  UNIQUE(user_id, sort_order)
);
```

### `courses`
```sql
CREATE TABLE courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,  -- 'SYSC 2006'
  name        TEXT NOT NULL,          -- 'Foundations of Imperative Programming'
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### `user_courses` (enrolled as student)
```sql
CREATE TABLE user_courses (
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id  UUID REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, course_id)
);
```

### `tutor_courses` (tutoring this course)
```sql
CREATE TABLE tutor_courses (
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id        UUID REFERENCES courses(id) ON DELETE CASCADE,
  group_price      DECIMAL,       -- NULL = not offered
  individual_price DECIMAL,       -- NULL = not offered
  session_type     TEXT DEFAULT 'both',  -- 'online' | 'in-person' | 'both'
  is_approved      BOOLEAN DEFAULT FALSE,
  proof_url        TEXT,           -- uploaded transcript/proof
  PRIMARY KEY (user_id, course_id)
);
```

### `connections`
```sql
CREATE TABLE connections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  status       TEXT DEFAULT 'pending',  -- 'pending' | 'accepted' | 'declined'
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);
```

### `blocked_users`
```sql
CREATE TABLE blocked_users (
  blocker_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);
```

### `posts` (The Board)
```sql
CREATE TABLE posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id   UUID REFERENCES courses(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  type        TEXT DEFAULT 'post',  -- 'post' | 'question'
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### `post_likes`
```sql
CREATE TABLE post_likes (
  user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id  UUID REFERENCES posts(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, post_id)
);
```

### `comments`
```sql
CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  parent_id  UUID REFERENCES comments(id), -- for replies
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `comment_likes`
```sql
CREATE TABLE comment_likes (
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, comment_id)
);
```

### `conversations`
```sql
CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

### `conversation_participants`
```sql
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);
```

### `messages`
```sql
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  status          TEXT DEFAULT 'sent',  -- 'sent' | 'delivered' | 'read'
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### `activities` (notifications)
```sql
CREATE TABLE activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,  -- who receives
  actor_id    UUID REFERENCES users(id),                      -- who triggered
  type        TEXT NOT NULL,  -- 'connection_request' | 'connection_accepted' | 'message' | 'board_like' | 'board_reply'
  reference_id UUID,          -- post_id, connection_id, conversation_id, etc.
  course_code TEXT,            -- for board_like/board_reply context
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. API Endpoints

Using Supabase client SDK, most of these are direct table queries. Complex ones become Edge Functions.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `supabase.auth.signUp()` | Email + password sign-up |
| POST | `supabase.auth.signInWithPassword()` | Email + password sign-in |
| POST | `supabase.auth.signInWithOtp()` | Phone OTP (fallback) |
| POST | `supabase.auth.verifyOtp()` | Verify email/phone code |
| POST | `supabase.auth.resetPasswordForEmail()` | Forgot password flow |
| POST | `supabase.auth.updateUser()` | Change password |

### Users / Profile
| Action | How |
|--------|-----|
| Create profile (after auth) | `INSERT INTO users` |
| Get my profile | `SELECT * FROM users WHERE id = auth.uid()` |
| Update profile | `UPDATE users SET ... WHERE id = auth.uid()` |
| Update status badge | `UPDATE users SET status = $1 WHERE id = auth.uid()` |
| Get user by ID | `SELECT * FROM users WHERE id = $1` (with RLS for visibility) |
| Upload profile photo | `supabase.storage.upload('avatars', file)` |

### Courses
| Action | How |
|--------|-----|
| Search courses | `SELECT * FROM courses WHERE code ILIKE $1 OR name ILIKE $1` |
| Enroll in course | `INSERT INTO user_courses` |
| Unenroll | `DELETE FROM user_courses` |
| Get my courses | `SELECT courses.* FROM courses JOIN user_courses ...` |
| Get course details (student/tutor counts) | Postgres VIEW or RPC function |

### The Board (Posts)
| Action | How |
|--------|-----|
| Get posts for course | `SELECT posts.*, users.name, ... FROM posts JOIN users ... WHERE course_id = $1 ORDER BY created_at DESC` |
| Create post | `INSERT INTO posts` + create activity for followers |
| Like/unlike post | `INSERT/DELETE post_likes` + create activity |
| Get comments for post | `SELECT comments.*, users.name ... FROM comments WHERE post_id = $1` |
| Add comment | `INSERT INTO comments` + create activity |
| Like comment | `INSERT/DELETE comment_likes` |

### Classmates (Discovery)
| Action | How |
|--------|-----|
| Get classmates | **Edge Function**: query users who share ≥1 course, exclude blocked users, exclude already-connected, apply gender visibility rules, paginate randomly |
| This is the most complex query — needs a dedicated function |

### Connections
| Action | How |
|--------|-----|
| Send request | `INSERT INTO connections` + create activity for receiver |
| Accept request | `UPDATE connections SET status = 'accepted'` + create activity for requester |
| Decline request | `UPDATE connections SET status = 'declined'` |
| Cancel request | `DELETE FROM connections WHERE requester_id = auth.uid() AND id = $1` |
| Get my connections | `SELECT * FROM connections WHERE (requester_id = auth.uid() OR receiver_id = auth.uid()) AND status = 'accepted'` |
| Disconnect | `DELETE FROM connections` |

### Blocking
| Action | How |
|--------|-----|
| Block user | `INSERT INTO blocked_users` + delete connection if exists |
| Unblock | `DELETE FROM blocked_users` |
| Get blocked list | `SELECT * FROM blocked_users WHERE blocker_id = auth.uid()` |

### Chat / Messaging
| Action | How |
|--------|-----|
| Get conversations | `SELECT conversations.* FROM conversations JOIN conversation_participants ... WHERE user_id = auth.uid()` |
| Get messages | `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at` |
| Send message | `INSERT INTO messages` (triggers realtime) |
| Create conversation | **Edge Function**: create conversation + add participants + send first message |
| Mark as read | `UPDATE messages SET status = 'read' WHERE conversation_id = $1 AND sender_id != auth.uid()` |
| Delete conversation | Soft delete or `DELETE FROM conversation_participants WHERE user_id = auth.uid()` |

### Activity / Notifications
| Action | How |
|--------|-----|
| Get activities | `SELECT activities.*, users.name ... FROM activities JOIN users ON actor_id = users.id WHERE user_id = auth.uid() ORDER BY created_at DESC` |
| Mark as read | `UPDATE activities SET is_read = TRUE WHERE id = $1` |
| Mark all read | `UPDATE activities SET is_read = TRUE WHERE user_id = auth.uid()` |

### Tutor-Specific
| Action | How |
|--------|-----|
| Register as tutor for course | `INSERT INTO tutor_courses` |
| Upload proof | `supabase.storage.upload('proofs', file)` + update `tutor_courses.proof_url` |
| Update pricing | `UPDATE tutor_courses SET group_price = $1, individual_price = $2` |
| Get tutors for course | `SELECT users.*, tutor_courses.* FROM users JOIN tutor_courses ... WHERE course_id = $1 AND is_approved = TRUE` |

---

## 5. Real-Time Features

Supabase Realtime gives us WebSocket subscriptions for free:

### Chat Messages (Critical)
```typescript
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`,
  }, (payload) => {
    // New message received — append to chat
  })
  .subscribe();
```

### Activity Feed
```typescript
supabase
  .channel('activities')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'activities',
    filter: `user_id=eq.${currentUserId}`,
  }, (payload) => {
    // New notification — update badge count
  })
  .subscribe();
```

### Conversation List Updates
Subscribe to `messages` table to update "last message" preview in conversation list.

### Online Status (Future)
Supabase Presence can track who's online — useful for showing green dots next to classmates.

---

## 6. Auth Flow

### Sign Up
```
1. User enters email + password on SignUpScreen
2. Frontend validates email ends with @cmail.carleton.ca (reject otherwise)
3. supabase.auth.signUp({ email, password })
4. Supabase sends verification email with OTP code to their @cmail.carleton.ca
5. User enters code on CodeVerificationScreen
6. supabase.auth.verifyOtp({ email, token, type: 'signup' })
7. On success → ProfileBasicsScreen collects profile data
8. INSERT INTO users (id = auth.uid(), name, pronouns, gender, ...)
9. INSERT INTO user_prompts (prompts from ProfilePromptsScreen)
10. INSERT INTO user_courses (courses from StudentCourseSelectionScreen)
11. If tutor → INSERT INTO tutor_courses + upload proof to storage
12. → Enter app
```

### Sign In
```
1. supabase.auth.signInWithPassword({ email, password })
2. On success → fetch user profile from users table
3. → Enter app
```

### Phone Verification (Future Fallback — not in v1)
```
If we add SMS later:
1. supabase.auth.signInWithOtp({ phone })
2. User gets SMS (requires Twilio setup, ~$0.01/text)
3. supabase.auth.verifyOtp({ phone, token, type: 'sms' })
```

### Session Persistence
- Supabase client SDK handles session tokens automatically
- Uses `@react-native-async-storage/async-storage` under the hood
- User stays logged in across app restarts
- `supabase.auth.onAuthStateChange()` listener handles token refresh

---

## 7. File Storage

### Buckets needed:
| Bucket | Purpose | Access |
|--------|---------|--------|
| `avatars` | Profile photos | Public read, authenticated write (own files only) |
| `proofs` | Tutor transcript/proof uploads | Private — uploader + admin (Kshitij) can view. Auto-approved, but admin can review via Supabase dashboard and delete fraudulent accounts. |

### Upload flow:
```typescript
// Profile photo
const { data } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file);

// Tutor proof
const { data } = await supabase.storage
  .from('proofs')
  .upload(`${userId}/${courseCode}.pdf`, file);
```

### Image optimization:
- Supabase supports image transforms (resize on-the-fly)
- `supabase.storage.from('avatars').getPublicUrl('path', { transform: { width: 200, height: 200 } })`

---

## 8. Privacy & Gender-Based Visibility

This is one of the trickiest parts. The spec says:
> Women/Non-binary users → can be viewed by other women/non-binary only.
> If a guy tries to tap their profile → toast message "You can't view this profile"

### Implementation with RLS:

```sql
-- Policy: Users can view profiles if:
-- 1. Target has visibility = 'everyone', OR
-- 2. Target has visibility = 'women-nb-only' AND viewer's gender is 'Woman' or 'Non-Binary', OR
-- 3. Viewer is looking at their own profile
CREATE POLICY "view_profiles" ON users FOR SELECT USING (
  id = auth.uid()
  OR profile_visibility = 'everyone'
  OR (
    profile_visibility = 'women-nb-only'
    AND (SELECT gender FROM users WHERE id = auth.uid()) IN ('Woman', 'Non-Binary')
  )
);
```

### For the Classmates feed:
The Edge Function that fetches classmates already filters by visibility, so restricted profiles never appear in the stack for users who can't view them.

### For post author taps:
Frontend already handles this — on tap, try to fetch profile. If RLS blocks it (returns null), show toast.

---

## 9. Phase Plan

### Phase 1: Foundation (Week 1-2)
**Goal:** Users can sign up, create profiles, and see their courses.

- [ ] Set up Supabase project
- [ ] Create all database tables + RLS policies
- [ ] Set up Supabase auth (email + optional phone)
- [ ] Install `@supabase/supabase-js` + `@react-native-async-storage/async-storage` in the RN project
- [ ] Create a `lib/supabase.ts` client
- [ ] Create a `hooks/useAuth.ts` hook (session management)
- [ ] Create a `hooks/useProfile.ts` hook
- [ ] Wire up SignUpScreen → real auth
- [ ] Wire up SignInScreen → real auth
- [ ] Wire up CodeVerificationScreen → real OTP
- [ ] Wire up ProfileBasicsScreen → INSERT into users
- [ ] Wire up ProfilePromptsScreen → INSERT into user_prompts
- [ ] Wire up StudentCourseSelectionScreen → INSERT into user_courses
- [ ] Wire up TutorCourseApplicationScreen → INSERT into tutor_courses
- [ ] Wire up TutorProofUploadScreen → Storage upload
- [ ] Wire up TutorPricingSetupScreen → UPDATE tutor_courses
- [ ] Create storage buckets (avatars, proofs)
- [ ] Replace hardcoded `userProfile` with real data from DB
- [ ] Replace `mockCourses` with real enrolled courses

### Phase 2: Social (Week 3-4)
**Goal:** Classmates discovery, connections, and activity feed work.

- [ ] Build classmates query Edge Function
- [ ] Wire ClassmatesScreen to real data (paginated)
- [ ] Implement connection request system (send/accept/decline)
- [ ] Wire ActivityScreen to real data
- [ ] Real-time activity subscription (new notifications)
- [ ] Wire ConnectionsListScreen to real data
- [ ] Implement blocking (blocked_users table + filter from feeds)
- [ ] Wire BlockedUsersScreen to real data
- [ ] Gender-based visibility RLS policies

### Phase 3: The Board (Week 5)
**Goal:** Course discussion boards are live.

- [ ] Wire CourseDetailScreen to fetch real posts
- [ ] Implement post creation
- [ ] Implement post likes (toggle)
- [ ] Wire PostDetailScreen to fetch real comments
- [ ] Implement comment creation
- [ ] Implement comment likes
- [ ] Create activities on like/comment (notify post author)

### Phase 4: Chat (Week 6-7)
**Goal:** Real-time messaging between users.

- [ ] Wire ChatListScreen to real conversations
- [ ] Create conversation (from "Message" button on tutor card or connection)
- [ ] Wire IndividualChatScreen to real messages
- [ ] Real-time message subscription (new messages appear instantly)
- [ ] Message status tracking (sent → delivered → read)
- [ ] Unread count badges (real-time)
- [ ] Conversation deletion

### Phase 5: Polish & Push (Week 8)
**Goal:** Push notifications, performance, edge cases.

- [ ] Set up Expo Push Notifications
- [ ] Send push on: new message, connection request, post like/comment
- [ ] Profile photo upload from EditProfileScreen
- [ ] Session persistence (stay logged in)
- [ ] Error handling + loading states across all screens
- [ ] Pagination for long lists (posts, messages, activity)
- [ ] Offline handling (queue messages, show cached data)
- [ ] Settings: change password, change email, delete account

---

## 10. Frontend Integration Checklist

Every `console.log('...')` in index.tsx is a stub that needs backend wiring:

| Current Stub | Backend Action |
|---|---|
| `onCreatePost: (content, type) => console.log(...)` | INSERT into posts |
| `onLikePost: (id) => console.log(...)` | Toggle post_likes |
| `onCommentPost: (id) => console.log(...)` | Navigate to post detail |
| `onMessageTutor: (id) => ...` | Create conversation + navigate |
| `onLikeComment: (commentId) => console.log(...)` | Toggle comment_likes |
| `onAddComment: (content) => console.log(...)` | INSERT into comments |
| `onNavigate: (screen) => console.log(...)` | In-app navigation |
| `console.log('Resending code to', ...)` | supabase.auth resend |
| `console.log('Saved pricing:', ...)` | UPDATE tutor_courses |

### State that needs to become server state:
| Current Local State | Replacement |
|---|---|
| `mockClassmates` array | Supabase query (classmates Edge Function) |
| `mockCourses` array | Supabase query (user_courses JOIN courses) |
| `mockPosts` array | Supabase query (posts for course) |
| `mockComments` array | Supabase query (comments for post) |
| `conversations` state | Supabase query + realtime subscription |
| `chatMessages` state | Supabase query + realtime subscription |
| `activities` state | Supabase query + realtime subscription |
| `connectedFriends` Set | Supabase query (accepted connections) |
| `sentConnectionRequests` Set | Supabase query (pending connections) |
| `blockedUsers` Set | Supabase query (blocked_users) |
| `bookings` state | Can be removed (no booking system in new app) |
| `notifications` state | Can be merged with activities |
| `tutors` array | Supabase query (tutor_courses JOIN users) |
| `userProfile` state | Supabase query (users table) |
| `myStudyingCourses` | Supabase query (user_courses) |
| `myTutoringCourses` | Supabase query (tutor_courses) |

---

## 11. Infrastructure & Deployment

### Supabase (Backend)
- **Free tier** covers development + small user base
- **Pro plan** ($25/mo) when you need: 8GB DB, 100GB storage, daily backups, email support
- No server to manage — Supabase handles everything

### React Native (Frontend)
- **Expo EAS Build** for creating iOS/Android builds
- **Expo EAS Update** for OTA updates (push code changes without app store review)
- Cost: Free for up to 30 builds/month

### Environment Setup
```
tutoring app/
├── lib/
│   └── supabase.ts          # Supabase client init
├── hooks/
│   ├── useAuth.ts            # Auth state management
│   ├── useProfile.ts         # User profile CRUD
│   ├── useCourses.ts         # Course enrollment
│   ├── useClassmates.ts      # Discovery feed
│   ├── useConnections.ts     # Connection management
│   ├── useChat.ts            # Messaging
│   ├── useActivity.ts        # Notifications
│   └── usePosts.ts           # Board posts & comments
├── .env                      # SUPABASE_URL, SUPABASE_ANON_KEY
```

### Packages to Install
```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
```

---

## Summary: What This Project Needs

| Layer | Tool | Cost |
|-------|------|------|
| Database | Supabase Postgres | Free → $25/mo |
| Auth | Supabase Auth | Included |
| Real-time | Supabase Realtime | Included |
| File Storage | Supabase Storage | Included |
| Complex Logic | Supabase Edge Functions | Included |
| Push Notifications | Expo Push | Free |
| Builds | Expo EAS | Free tier |

**Total cost to start: $0.** Scale to Supabase Pro ($25/mo) when you need more storage/bandwidth.

---

## TL;DR — Next Steps

1. ~~**You** create a Supabase project and share the URL + anon key~~ DONE
2. ~~**I** set up the database schema + RLS policies + seed 3,808 courses~~ SQL ready in `supabase/migrations/`
3. ~~**I** create `lib/supabase.ts` and the hooks layer~~ Client created
4. ~~**I** generate placeholder legal text for Privacy Policy + Terms of Service~~ DONE
5. **Run migrations** — paste the SQL files into Supabase SQL Editor
6. **Start wiring screens** — Phase 1 (auth + profile) first

# Backend and App Functionality: Remaining Work

**Reviewed:** 2026-10-21  
**Scope:** Remaining work to make the app's Supabase-backed features reliable and production-ready. This is a current-state checklist, not a replacement for the architecture and implementation detail in [BACKEND_PLAN.md](./BACKEND_PLAN.md).

## Already implemented in the repository

These foundations are present and should not need to be built from scratch:

- Supabase client, persisted auth session, email/password and email OTP flows, password reset, account deletion, and profile CRUD.
- SQL migrations for the schema, course seed, RLS fixes, reports/chat read tracking, and activity/chat policies (`supabase/migrations/001` through `006`).
- Supabase hooks for courses, classmates, connections, activity, chat, and board posts/comments.
- Edge Functions for classmates discovery, conversation creation, and account deletion.
- Avatar and tutor-proof storage upload helpers.
- Frontend screens are connected to live data for core profile, course, classmate, connection, activity, board, and chat workflows.
- The local `.env` selects live mode. This does **not** establish that the hosted project, its migrations, or production hosting variables are current.

## Prioritized remaining work

### 1. Verify the hosted backend and production configuration

- [x] Confirm the intended Supabase project is active and has migrations `001`–`006`, including the course seed (`002`) and supplemental course migration (`004`). The live course endpoint responds and includes `COMP 4801`.
- [x] Confirm the `classmates`, `create-conversation`, and `delete-account` Edge Functions are active in that project.
- [ ] Apply and verify migrations `007` and `008`. The remote migration history currently stops at `006`; the new onboarding transaction and storage repair are pending.
- [ ] Verify the hosted `avatars` and `proofs` buckets and their access policies with authenticated uploads and reads. Both buckets are currently missing (`NoSuchBucket`); migration `008` restores them and their policies.
- [ ] Verify Supabase Auth email/OTP delivery, redirect URLs, and password-reset links in the hosted app.
- [ ] Check the GitHub Actions secrets required by [supabase-migrations.yml](./.github/workflows/supabase-migrations.yml) and the production URL/key plus `EXPO_PUBLIC_DEMO_MODE=false` used by [deploy-web.yml](./.github/workflows/deploy-web.yml). The web workflow defaults to demo mode when that variable is absent.
- [ ] Run a two-account smoke test against the hosted project: sign up/verify, finish onboarding, edit profile, discover/connect, post/comment/like, message, report, block/unblock, reset password, and delete account.

### 2. Make backend failures visible and recoverable in the UI

- [x] Add loading, empty, error, and retry states to course, classmates/connections, activity, chat, board, course search, and blocked-user screens.
- [x] Preserve post, comment, and message composer contents when their writes fail; show the failure and allow retry.
- [x] Check and surface errors from course enrollment, tutor-course changes, likes, activity read/delete actions, connection actions, uploads, and message status updates; roll back optimistic UI where applicable.
- [ ] Make onboarding writes recoverable as a unit. The app now calls `complete_profile`, which atomically writes profile, prompts, enrollments, and tutor courses, but the new migration `007` is not yet applied remotely.

### 3. Complete notifications and moderation workflows

- [ ] Implement real push notifications for messages, connection requests, and board activity (including Expo/APNs/FCM setup, token registration, user preferences, and delivery handling). The current Settings message-notification toggle is local component state only.
- [ ] Provide a way for an authorized moderator to review reports. Reports are stored in the database, but there is no in-app moderation queue or review workflow.
- [ ] Decide and consistently implement tutor-proof policy. Current signup allows proof URLs to be absent and inserts tutor courses as approved; there is no in-app review path. If automatic approval is intentional, make that choice and the optional-proof behavior explicit in the UI. If proof/review is required, enforce it before listing tutors.

### 4. Close remaining social, privacy, and messaging gaps

- [ ] Apply profile visibility and block rules consistently to tutor listings and related profile data. The tutor-course read policy is public, and the course tutor query filters users this account blocked but does not filter users who blocked this account.
- [ ] Define the expected semantics for deleting/leaving a conversation. It currently removes only the caller's participant row, so the other participant can retain a thread whose counterpart is no longer available; make list behavior and rejoining consistent with that choice.
- [ ] Add cursor/offset pagination and load-more behavior for classmates, course-board posts/comments, activity, and chat history. Current reads are capped or fetch the full result set rather than providing a complete paginated feed.
- [ ] Decide whether message status should include read receipts. The app tracks unread conversations with `last_read_at` and updates sent/delivered state, but does not set or display a per-message `read` state.
- [ ] Add an outgoing connection-request view or another clear way to review/cancel pending requests outside the classmates deck.

### 5. Finish user-facing settings and navigation

- [ ] Add a supported path for an existing student account to become a tutor; `is_tutor` is currently set during onboarding only.
- [ ] Connect the tutor-area `onNavigate` handlers that currently log the requested screen instead of navigating.
- [ ] Persist language selection or remove/disable the unused language control; the live profile currently supplies a hard-coded English value.
- [ ] Decide whether phone-number storage is in scope. The profile currently supplies an empty phone value, and phone OTP is intentionally not part of the current onboarding flow.

### 6. Add backend-side validation and release verification

- [ ] Enforce important input limits and allowed values on the backend/database as well as in forms, especially for names, bio/status, prompts, posts/comments/messages, tutor prices, and tutor session type. Several schema columns are unconstrained `TEXT` or `DECIMAL`.
- [ ] Add automated coverage for the core hooks, RLS-sensitive flows, and Edge Functions, plus a repeatable smoke-test checklist for the deployed project.
- [ ] If native distribution is in scope, add and validate EAS build configuration and store credentials; the current repository has a web deployment workflow but no native release setup.

## Intentionally not required for the current v1 scope

Do not treat these as outstanding unless the product scope changes: payments, bookings/calendar availability, SMS/phone OTP, online presence, and nested multi-level comment threads. See the scope decisions in [BACKEND_PLAN.md](./BACKEND_PLAN.md).

## Related implementation notes

- [WHAT_IS_LEFT.md](./WHAT_IS_LEFT.md) contains a deeper code-level audit. It was checked earlier in October; this checklist omits items that the current code now handles, including signup profile image/visibility/pricing, loading prompts into Edit Profile, syncing the changed email to the profile row, and deleting handled activity rows.
- Hosted Supabase state was checked with the configured project credentials: migrations `001`–`006` are applied, the three Edge Functions are active, email auth is enabled, and the course seed is present. A CLI dry run confirmed `007` and `008` are pending. Email delivery and two-user flows still need a real account test.
- The latest visible GitHub Pages and Supabase migration workflow runs succeeded on 2026-10-05. GitHub secret values and the current `EXPO_PUBLIC_DEMO_MODE` repository variable cannot be inspected here; the web workflow now fails closed unless production mode is explicitly `false` and both public Supabase settings are configured.
- Authenticated storage upload/read checks cannot pass until the missing buckets are restored by migration `008`. Apply the pending migrations before using signup/photo/tutor-proof flows with the new onboarding RPC.

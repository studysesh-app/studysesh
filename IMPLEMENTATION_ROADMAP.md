# Functional product roadmap

Reviewed 2026-11-10 against the live application and the existing planning documents. This is an execution order, not a claim that the hosted backend or every feature is complete. [BACKEND_REMAINING_WORK.md](./BACKEND_REMAINING_WORK.md) and [WHAT_IS_LEFT.md](./WHAT_IS_LEFT.md) are older audits; their hosted migration status is superseded below. Product flow is described in [_figma-social/FLOW_ANALYSIS.md](./_figma-social/FLOW_ANALYSIS.md), and the backend scope decisions are in [BACKEND_PLAN.md](./BACKEND_PLAN.md).

## Completed in this session

- Connections now shows sent requests and lets the sender cancel them, with a refresh and error reporting. The list reloads when opened; unavailable profiles do not prevent cancellation.
- Removed the nonfunctional message-notification switch. Settings now explains that push is unavailable and directs users to Activity and Messages.
- Course counts are labelled as posts rather than online/active people. Corrected null tutor-pricing editor defaults to the existing onboarding slider defaults.
- Tutor onboarding describes automatic approval and requires removal of an existing proof before replacement; continuation is disabled during upload. The shared proof uploader also enforces the advertised 10 MiB limit.
- Classmate discovery now fails rather than returning potentially unsafe results if its block, connection, profile, course, or prompt queries fail. The Edge Function must be redeployed for this change to reach hosted users.

These are local code changes, not evidence that migrations or functions have been deployed or that two-account workflows have been tested.

## Additional work in the follow-up session

- Added migrations `009`–`030`: visibility/block-aware profile, enrollment, board and tutor reads; owner-only tutor proof paths and a restricted tutor-listing RPC; block-aware chat policies; proof metadata checks for newly approved listings; atomic student-to-tutor conversion; database input limits; connection-request authorization and pair uniqueness; cursor-based classmate and activity discovery; atomic connection activity creation and cleanup; conversation lifecycle and summary pagination; an authorized report review queue; private, Auth-synchronized profile email; board post/comment pagination; private avatar storage; privacy-scoped board broadcasts; visibility-checked board writes; account deletion cleanup; atomic profile/prompt edits; a push delivery queue; and safe retired-course handling. Added SQL regression tests in `supabase/tests/`.
- Added the student-to-tutor course/proof/pricing flow and explicit student/tutor mode switching. Demo-mode navigation was exercised in a browser; the real upload and hosted conversion have not yet been exercised.
- Removed fallback fake tutor courses and misleading pending-approval copy. The app now checks request status during accept, decline and cancellation to avoid deleting an already accepted request.
- Removed unused hard-coded phone and language profile values; neither is exposed as a live setting. Phone/SMS and localization remain outside the current functional scope.
- Hosted migration history was read without changing data and reports `001`–`008` applied. A read-only aggregate audit found one approved tutor listing without an associated stored proof. Migration `011` validates new approvals and proof changes but intentionally does **not** unpublish legacy listings.
- Migrations `009`–`030` are **not deployed**. They and the app changes are coupled: the new client needs the new RPCs, while old clients expect public tutor-course reads and public avatar URLs, select profile emails and create connection activities themselves. Coordinate staging, Edge Function deployment and client rollout; do not apply the migrations alone to a live deployment. A read-only aggregate check found no duplicate active connection pairs, but migration `014` will fail rather than delete data if duplicates exist at rollout time. Migration `017` removes stale connection-request activity rows that no longer correspond to a pending request. Migration `023` requires non-null post and comment timestamps; a read-only check found no violations in the configured project.
- Chat hiding now preserves participants and history, reopens on a new message, and serializes new pair creation; message and conversation pages use stable cursors and an uncapped server unread count. `sent`/`delivered` remain the visible message statuses; per-message read receipts are not part of this implementation. A read-only audit found no existing hosted conversations at the time of this session. For other databases, migration `018` backfills complete two-participant threads, but cannot infer a missing participant for legacy single-participant threads and leaves those unchanged.
- Reports collect a reason in the app rather than opening an email draft. Report review is available only to explicitly provisioned moderators. Reviewing or dismissing a report records an audit entry; neither action automatically suspends or deletes an account.
- Profile emails are no longer selectable from other users' rows. The app reads its own email from Auth, and migration `022` synchronizes the profile only after Auth changes the verified email. Migration `021` also fixes the prompt-ordinality bug in the existing onboarding transaction.
- Avatar references are stored as private bucket paths; the client also supports existing public-bucket URLs by converting them to paths before requesting a five-minute signed URL. Storage policies check the viewer's profile visibility and blocks. Signed URLs already issued remain valid until expiry, and previously public CDN/browser caches may persist; validate cache behavior and revocation on the real deployment.
- Board posts and comments have cursor pages, uncapped server counts, retries and explicit refresh controls; author profile navigation uses IDs. Private per-viewer broadcasts signal authorized inserts, deletions and likes without exposing restricted actors or content. A reconnect prompts the viewer to refresh to recover any missed events.
- Account deletion now removes owned avatar/proof objects before deleting Auth, blocks new storage mutations during a short deletion lease, and repairs deletion-blocking foreign keys. A failed operation may have removed some files and is explicitly reported for retry. Profile and prompt edits now commit in one transaction.
- Push registration, account preferences, an activity-driven outbox and an authenticated Expo worker with receipts and retries are implemented behind a disabled-by-default native build flag. [PUSH_SETUP.md](./PUSH_SETUP.md) lists the required Expo project, credentials, worker secret, scheduler and device checks.
- Catalog import tooling validates a supplied complete source, preserves historical course IDs and marks retired courses inactive. The checked-in data remains stale until an authorized source is supplied and reviewed; see [CATALOG_IMPORT.md](./CATALOG_IMPORT.md).
- Basic EAS preview and production profiles are present; Expo project ownership, app identifiers, signing credentials and actual native builds remain owner-controlled.
- The application checks workflow runs the app type-check, hook tests, isolated database tests, a demo web export and Deno Edge Function checks on pull requests and pushes to `main`. Web exports clear Metro's cache, and CI/deployment verify that the emitted bundle contains the intended public Supabase URL and anon key; this prevents a previous build's environment from being silently reused.
- Validation: web export, `npm run typecheck`, `npm test`, `npm run test:db` and a Deno check of the Edge Functions passed; twenty-one SQL regression scripts passed against an isolated PostgreSQL-compatible engine with a minimal Supabase schema, including fanout to 1,101 eligible course members. `test:db` mocks Auth, Storage and Realtime and skips seed/storage migrations; it does not replace Supabase integration tests or real-device verification.

## Ordered remaining work

### 1. Restore and verify the live foundation — release blocker

- [x] Read the configured hosted project's migration history: `001`–`008` are applied.
- [ ] Test and deploy `009`–`030` together with the matching client after arranging a compatible rollout. Verify `complete_profile`, atomic profile editing, the Auth email trigger, seeded courses, bucket visibility and policies with authenticated uploads and reads.
- [ ] Deploy the updated `classmates`, `create-conversation`, `delete-account` and `push-worker` functions and verify them, including deletion of nested storage objects. Verify production URL/key, `EXPO_PUBLIC_DEMO_MODE=false`, workflow secrets, auth email/OTP delivery, redirects and password-reset links without exposing secret values.
- [ ] Run a two-account smoke test across signup, onboarding, profile editing, discovery, connections, board, chat, reports, blocking, reset and deletion. Record actual results and retry failures.

**Why still open:** The new database policies change the old client's tutor queries, so an uncoordinated database deployment would break existing users. A staging environment or approved deployment window, working email accounts and authenticated two-account testing are needed. No deployment or authenticated two-account smoke test was performed in this session.

### 2. Enforce privacy and social consistency on the server — release blocker

- [ ] Deploy and integration-test the new visibility and block policies on profiles, prompts, enrollments, tutor listings, posts, comments and current chat participants. Audit other related data and direct API paths; client filtering is not an authorization boundary. Verify private storage access and privacy after leaving a conversation.
- [ ] Deploy and verify private avatars on native and web, including legacy public URL references, existing cache invalidation, blocked/ineligible viewers and signed-URL expiry. The hosted bucket remains public until migration `024` is deployed.
- [ ] Deploy and integration-test the new conversation hide/reopen semantics, concurrent pair creation and blocking. Audit legacy single-participant or duplicate threads before deploying to any database other than the currently audited project.
- [ ] Deploy and integration-test the new connection authorization, active-pair uniqueness, atomic request/notification creation and guarded cancellation/acceptance with two users, including concurrent actions and stale existing notifications.

**Why still open:** Local policies have isolated tests but are not deployed or exercised with real Supabase accounts. Verification of conversation rejoining, concurrency, stale activity cleanup and the remaining cross-table audit is not complete.

### 3. Complete tutor and account journeys

- [ ] Deploy and test the implemented student-to-tutor flow with a real upload, failure/retry, preserved enrollments and role switching.
- [ ] Decide how to remediate the existing approved listing without stored proof. New approved listings require an owned, course-specific stored document with allowed MIME metadata and size; metadata is not content inspection. Verify real uploads, concurrent storage mutations and an administrator review/revocation process before claiming full proof enforcement.
- [x] Keep the unused language choice and phone control out of the live app; neither is presented as a working setting. Revisit only if localization or phone storage enters scope.
- [ ] Provision an authorized moderator and integration-test the report queue, role isolation and audit records. Decide operational escalation and account-enforcement procedures; closing a report does not automatically discipline an account.

**Why still open:** Tutor conversion is implemented locally but not deployed or tested end to end; legacy proof remediation and moderation need a decision and authorized tooling.

After migration `020`, a project owner can grant a trusted existing user access using the Supabase SQL Editor:

```sql
INSERT INTO public.moderators (user_id)
VALUES ('<existing-user-uuid>'::uuid)
ON CONFLICT DO NOTHING;
```

Revoke access by deleting that specific moderator row in the SQL Editor. Do not paste credentials or report contents into chat.

### 4. Make feeds complete and notifications real

- [ ] Deploy and integration-test the new UUID cursor and load-more flow for classmates, including changes to blocks and connections between pages.
- [ ] Deploy and integration-test Activity pagination, realtime changes and the full unread count.
- [ ] Deploy and integration-test chat message and conversation pagination, realtime updates, retries, deduplication and the full unread count.
- [ ] Deploy and integration-test board post/comment pagination, counts, retries, privacy and private Realtime broadcasts for inserts, deletions and likes. Verify existing Realtime policies do not grant broader topic access and load-test per-member fanout at expected course sizes; explicit refresh remains available.
- [ ] Provision the Expo project, APNs/FCM credentials, push worker secret and scheduler, then enable and integration-test the implemented registration, preferences, delivery, receipt, retry and cleanup paths. Keep the build flag disabled until delivery is verified.
- [ ] Verify foreground/background/terminated delivery, permission denial and multiple devices on real iOS and Android devices.

**Why still open:** Pagination, Realtime broadcasts and push delivery are local and not integration-tested on hosted Supabase or native devices. Push requires owner-controlled Expo/APNs/FCM credentials, a scheduler and device testing; see [PUSH_SETUP.md](./PUSH_SETUP.md).

### 5. Data integrity, catalog and automated coverage

- [ ] Deploy and integration-test migration `013` and the matching UI limits. The constraints are `NOT VALID`: they enforce new writes but do not validate historical rows; audit and repair all legacy rows before validating them. A read-only aggregate check found no violations of the checked length and price limits in the configured project at the time of this session. Extend allowed-value and direct-API coverage as needed.
- [ ] Obtain an authorized, complete current catalog and follow [CATALOG_IMPORT.md](./CATALOG_IMPORT.md) to review and deploy it alongside matching demo data. The local catalog is still stale; tooling alone does not refresh it.
- [ ] Extend the new database policy tests to cover auth/onboarding, hooks, failure recovery, Edge Functions, and the two-account scenarios above. Use [SMOKE_TEST.md](./SMOKE_TEST.md) for deployed checks. Add a separate Deno/Edge Function check; `npm run typecheck` checks the Expo app and its imports, not archived projects or Edge Functions.

**Why still open:** Requires a migration and existing-data audit, a verified catalog refresh, and integration test infrastructure. Isolated SQL tests and app type-checking do not establish hosted RLS or Edge Function behavior.

### 6. Product polish and release

- [ ] Implement the visual token/font migration in [UI_REBRAND_PLAN.md](./UI_REBRAND_PLAN.md), preserving navigation and behaviour; verify light/dark, web and native accessibility. Review the color map before changing semantic colors.
- [ ] Replace placeholder legal text with reviewed copy; decide whether profile status appears to other users.
- [ ] Configure the EAS project, app identifiers, signing, store listings and credentials; validate the included preview/production profiles with real builds and deep links. Web deployment also needs the production configuration checks in phase 1.

**Why still open:** Rebrand and legal review are separate from the functional fixes; native release requires owner-controlled Apple/Google credentials and device testing. No legal, store or release approval occurred in this session.

## Scope guardrails

Payments, bookings/calendar availability, SMS/phone OTP, online presence and multi-level comment threads are not current v1 requirements. Do not introduce mock equivalents as if they were functional. Keep pending tasks above visible until code, deployment and acceptance checks are complete.

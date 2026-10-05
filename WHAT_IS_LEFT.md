# What’s left (after 2026-09-29 wiring pass)

This is the leftover list after wiring comments, tutor pricing, Connect reports, chat sent/delivered, homepage status persist, and stripping fake bookings / phone OTP.

UI refreshes are yours and are not listed here.

Checked again 2026-10-03 against the live app (`app/`, `hooks/`, imported `components/`, `lib/`, `supabase/`). The sections below are still true. Corrections are marked inline. New product/logic gaps are at the bottom. Visual polish is still out of scope.

---

## Needs a product call (you asked to park these)

- **Status on other people’s profiles.** Still true. Homepage status saves to `users.status` and survives reload (`app/index.tsx` `handleStatusChange` → `useAuth.updateProfile`), but it is still only rendered on your own home (`StudentHomeScreen`, `TutorHomeScreen`). Decide later whether it should show on Connect cards, profiles, and/or chat.
- **Student → tutor after signup.** Still true. `is_tutor` is only written in `useAuth.createProfile` during onboarding. There is no “become a tutor” path for an existing student account.
- **Message notifications toggle.** Still true. `SettingsScreen` keeps `messageNotifs` in component state only. Real push needs Expo + Apple/Google credentials. Until then it does nothing for other devices, and it resets every time you open Settings.
- **Legal copy.** Still true. Privacy Policy and Terms screens exist with drafted in-app text (`PrivacyPolicyScreen`, `TermsOfServiceScreen`, “Last updated: March 11, 2026”). Contact email is `studysesh.cu@gmail.com`. Swap in lawyer-reviewed copy when you have it.

---

## Needs you (accounts / infra)

- **Live Supabase.** Run `supabase/migrations/` on the hosted project (including **`005_reports_and_chat_read.sql`** — reports table + `conversation_participants.last_read_at`). Deploy Edge Functions (`classmates`, `create-conversation`, `delete-account`). Set `EXPO_PUBLIC_DEMO_MODE=false` and the URL/anon key. Leaving demo mode on skips real auth: any OTP works, and `ProfileBasicsScreen` fills empty required fields with fake data.
- **Push notifications.** Not started. Needs an Expo project, APNs / FCM, and rules for when to ping (message / connect / board).
- **App Store / Play.** No EAS config yet. Needs Apple Developer + Google Play accounts, then `eas.json` + builds.
- **Admin tutor-proof review.** Proofs go to a private Storage bucket. Plan was: you review in the Supabase dashboard, no in-app admin. **Correction:** the app always inserts `is_approved = true` (`useAuth.createProfile`, `useCourses.addTutoringCourse`). Course boards only hide a tutor if you manually flip that flag. Until then every tutor listing is live, including ones with no proof file.

---

## Fine to cut or ignore for v1

- In-app payments, bookings, calendar availability (already out of spec; fake booking data was removed from the live app).
- SMS / phone OTP (screens removed from onboarding). `PhoneInputScreen` still exists in `components/onboarding/` but `app/index.tsx` does not mount it. `CodeVerificationScreen` only shows “Try phone verification” if `onPhoneVerify` is passed, and the live app does not pass it.
- Online / last-seen presence.
- Nested Reddit-style comment threads (v1 is Instagram-style: one level of replies under a comment). Still true in `PostDetailScreen` — Reply on a reply is flattened onto the parent comment.

---

## Smaller follow-ups (not blocked, not done)

- Pagination / “load more” for classmates, board, chat history, activity. Still true. Classmates is worse than “no button”: `supabase/functions/classmates/index.ts` slices to 30 with no ordering, and `useClassmates` always asks for `limit: 30`. Anyone past that slice never shows up.
- Chat “delivered” only updates when the other person’s app is open or they fetch the thread (`useChat` realtime INSERT, or `fetchMessages`). No push yet, so it won’t tick delivered if they’re fully quit. `messages.status` also allows `'read'`, and nothing in the app ever sets that.
- Report emails open the mail app; rows also land in `reports` for you to query in Supabase. No in-app moderation queue. Still true (`useConnections.report` + `openSupportEmail` in `app/index.tsx`).
- Support / “Report a Problem” opens mailto `studysesh.cu@gmail.com`. Still true (`SettingsScreen`, `lib/support.ts`).

---

## Product / logic gaps (found 2026-10-03)

These are new. They are behavior bugs, not visual ones.

### Validation and limits

UI caps are not in the database. `001_initial_schema.sql` uses plain `TEXT` for name, bio, status, prompts, posts, comments, and messages. No `CHECK` on length. A client that skips the UI can store anything.

| Field | UI | DB |
| --- | --- | --- |
| Prompt answer | 150 chars (`ProfilePromptsScreen`, `EditProfileScreen`) | none |
| Bio | 300, tutors only (`EditProfileScreen`) | none |
| Status | 24 (`StudentHomeScreen`, `TutorHomeScreen`) | none |
| Comment | 500 (`PostDetailScreen`) | none |
| Name, major | none | none |
| Board post | none (`CourseDetailScreen` composer) | none |
| Chat message | none (`ChatInput`) | none |
| Prices | sliders $2–$10 group and $10–$30 individual | `DECIMAL`, no range |

- **Onboarding prompts are not actually required.** `ProfilePromptsScreen` computes `isValid` as 3 filled prompts, then ignores it (`if (true)`, comment says “DEV: bypassed”). Continue is always enabled. Zero prompts writes fake answers into the real profile: “the library”, “grab coffee”, “chips”. This is **not** behind `DEMO_MODE`, so it ships in prod.
- **Password length disagrees with itself.** Sign up requires 6 (`SignUpScreen`, `useAuth.signUp`). Change password requires 8 (`ChangePasswordScreen`).
- **`@cmail.carleton.ca` is only enforced on sign up.** `SignUpScreen` and `useAuth.signUp` check the domain. `SignInScreen` / `useAuth.signIn`, `ForgotPasswordScreen` / `useAuth.resetPassword`, and `ChangeEmailScreen` / `useAuth.updateEmail` do not. Change Email only checks “looks like an email”.
- **Changing email does not update `public.users.email`.** `updateEmail` only calls `supabase.auth.updateUser`. Settings keeps showing the old address from the profile row.
- **Forgot-password copy says it sends a code.** The screen text says “code”; `useAuth.resetPassword` sends Supabase’s reset link, and the alert says “link”.
- **Tutor proof is optional at signup.** `TutorProofUploadScreen` computes `allCoursesHaveProof` and never uses it. Continue works with zero files. The copy says you need proof. Adding a tutoring course later from `CourseInputModal` does block save until a file is picked. The “up to 10MB” line is also only copy — `uploadTutorProof` does not check size.
- **Onboarding group price starts at $15** while that slider is labeled $2–$10 (`TutorPricingSetupScreen`). Pricing editor fallbacks are $20 / $40 when the row is null (`app/index.tsx`), also outside the slider max. Dragging clamps; opening and saving does not.
- **Edit Profile can save a blank name.** No required check and no max length (`EditProfileScreen.handleSave`). `users.name` is `NOT NULL`, which still allows `''`.

### Persistence (looks saved, isn’t)

- **Profile photo never persists.** `ProfileBasicsScreen` picks an image. Both `createProfile` calls in `app/index.tsx` drop `profileImage`. `EditProfileScreen` keeps a `profileImage` state and a picker, then `handleSave` omits it, so the upload branch in `app/index.tsx` never runs.
- **“Women & Non-Binary only” chosen at signup is dropped.** `ProfileBasicsScreen` collects `profileVisibility`. The same `createProfile` calls never pass it, so the row stays `'everyone'`. Edit Profile does send it later.
- **Tutor prices chosen at signup are dropped.** `TutorPricingSetupScreen` returns `{ group, individual }`. `app/index.tsx` reads `groupPrice` / `individualPrice`, gets `undefined`, and stores null. Session type (online / in-person / both) is also not passed; `tutor_courses.session_type` stays the default `'both'`. Saving again from `PricingEditorScreen` does write prices and session type (`useCourses.saveTutoringPricing`).
- **Edit Profile does not load your prompts.** `EditProfileScreen` starts `prompts` at `[]` and never reads `user_prompts`. The screen shows 0/3 even when three are saved. Saving with any prompt calls `updateProfile`, which deletes every row and inserts only what the form has. One new prompt wipes the originals.
- **Bio is tutor-only and never shown.** The field is behind `isTutor` in `EditProfileScreen`, and `handleSave` sends `bio` only for tutors. `ProfileCard` does not render `bio`, even though the classmates function returns it.
- **Signup can succeed while prompts or courses failed.** `useAuth.createProfile` logs prompt, enrollment, and tutor-course errors and still returns success.
- **`users.phone` is never written.** The column is in the schema. Live profile state hardcodes `phone: ''` in `app/index.tsx`.
- **Language is hardcoded.** `app/index.tsx` sets `language: 'English'`. `LanguageSelectionScreen` is not imported by the live app.

### UX that fails functionally

- **Returning users see Welcome first.** `isOnboarding` starts `true`. The app only leaves onboarding after `useAuth` finishes loading a session and profile. There is no loading gate, so a logged-in user flashes the welcome screen.
- **Empty, loading, and error look the same on Connect.** `useClassmates` has `loading` and `error`. `app/index.tsx` ignores both. `ClassmatesScreen` then shows “No classmates yet” while the request is in flight or after the function fails. Same pattern for a failed board/chat/connect write: `usePosts`, `useChat`, and `useConnections` `console.error` and the UI does not. The composer in `CourseDetailScreen` and `ChatInput` clears the text immediately, so a failed post or message looks sent and then disappears.
- **Home “N active” is the post count**, not people online (`useCourses` counts `posts`, `StudentHomeScreen` labels it “active”). A course with zero enrollments also has no empty state — the list is just blank under “0 courses”.
- **Blocked Users shows “Unknown User” after reload.** The list in `app/index.tsx` looks up names in the classmates array. The classmates function excludes anyone in `blocked_users`, so the name is gone.
- **Messages “Tutors” / “Students” filter doesn’t match real data.** `useChat` sets every conversation `type: 'student'`. `ChatListScreen`’s Tutors filter looks for `type === 'tutor'`, so a student who taps it sees “No messages yet” even when threads exist. A tutor who taps Students sees everyone.
- **Opening a connection’s profile can crash.** `useConnections` friend rows have no `prompts`. `handleViewProfile` passes that object into `StudentProfileModal` → `ProfileCard`, which calls `prompts.map` with no default. Classmate cards are fine because the classmates function includes prompts. Tapping a board or chat profile for someone who is neither a current classmate nor a loaded friend does nothing (`handleViewProfile` returns without opening).
- **Activity avatars look up by name, not id.** `useActivity` already has `userId`. `ActivityScreen` still calls `onViewProfile(activity.userName)` (there’s a TODO in that file). `app/index.tsx` searches classmates by name only, so friends, non-classmates, and two people with the same name resolve wrong or not at all.
- **Dead UI that is not actually reachable.** `TutorDetailModal` is mounted in `app/index.tsx`, but `selectedTutorForDetail` is never set. `NotificationsScreen`, `LanguageSelectionScreen`, `StudentProfileCompletionScreen`, `TutorProfileCompletionScreen`, and `TutorStudentsScreen` are not imported by the live app. Onboarding types `student-profile-completion` and `tutor-profile-completion`, and profile type `'notifications'`, are never navigated to.

### Two-user breaks and privacy

- **A pending request removes the person from Connect, with nowhere to cancel.** `classmates/index.ts` treats every `connections` row as “already connected”, including `pending`. After reload they are gone from the deck. `cancelRequest` exists on the hook, but there is no outgoing-requests screen. The unique key is `(requester_id, receiver_id)` only, so A→B and B→A can both exist.
- **Accept and Decline don’t stick in Activity.** `isPending` is `type === 'connection_request'` forever (`useActivity`). Decline deletes the connection row but `removeActivity` only filters local state. There is no `activities` DELETE policy, so the row comes back on refresh and Accept no-ops (`acceptRequest` returns when the connection is gone). After a real accept, the Accept/Decline buttons still show.
- **Block does not stop DMs or tutor cards.** Classmates and board posts respect `blocked_users` (function + posts RLS). `create-conversation` does not check blocks, and the course-tutor query in `app/index.tsx` does not either. A blocked person can still message you, and can still appear under Tutors.
- **Deleting a chat only removes you.** `useChat.deleteConversation` deletes your `conversation_participants` row. The other person keeps the thread (name falls back to “Unknown”). The next `create-conversation` does not find a shared row, so it creates a second thread.
- **`women-nb-only` hides the profile row, not the rest of you.** `users_select` (migration `003`) and the classmates function both check it. Posts, comments, and `tutor_courses` do not. A man can still read that person’s board posts (author shows as “Unknown” because the user embed is filtered) and can still see them on a course’s Tutors tab. `tutor_courses` is `SELECT` for everyone, so `proof_url` paths are readable even though the proofs bucket is private.
- **Switching gender does not clear a women-nb-only setting.** The control only renders for Woman / Non-Binary (`EditProfileScreen`). Changing to Man sends `profileVisibility: undefined`, and `updateProfile` skips the column. The old restriction stays on the row with no control left to turn it off.

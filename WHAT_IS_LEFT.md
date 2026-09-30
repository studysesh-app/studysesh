# What’s left (after 2026-09-29 wiring pass)

This is the leftover list after wiring comments, tutor pricing, Connect reports, chat sent/delivered, homepage status persist, and stripping fake bookings / phone OTP.

UI refreshes are yours and are not listed here.

---

## Needs a product call (you asked to park these)

- **Status on other people’s profiles.** Homepage status now saves to `users.status` and survives reload, but it is still only visible on *your* home. Decide later whether it should show on Connect cards, profiles, and/or chat.
- **Student → tutor after signup.** `is_tutor` is set during onboarding. There is no “become a tutor” path for an existing student account.
- **Message notifications toggle.** Settings switch is still local-only. Real push needs Expo + Apple/Google credentials. Until then it does nothing for other devices.
- **Legal copy.** Privacy Policy and Terms screens exist with placeholder text. Contact email is `studysesh.cu@gmail.com`. Swap in lawyer-reviewed copy when you have it.

---

## Needs you (accounts / infra)

- **Live Supabase.** Run `supabase/migrations/` on the hosted project (including **`005_reports_and_chat_read.sql`** — reports table + `conversation_participants.last_read_at`). Deploy Edge Functions (`classmates`, `create-conversation`, `delete-account`). Set `EXPO_PUBLIC_DEMO_MODE=false` and the URL/anon key.
- **Push notifications.** Not started. Needs an Expo project, APNs / FCM, and rules for when to ping (message / connect / board).
- **App Store / Play.** No EAS config yet. Needs Apple Developer + Google Play accounts, then `eas.json` + builds.
- **Admin tutor-proof review.** Proofs go to a private Storage bucket. Plan was: you review in the Supabase dashboard, no in-app admin.

---

## Fine to cut or ignore for v1

- In-app payments, bookings, calendar availability (already out of spec; fake booking data was removed from the live app).
- SMS / phone OTP (screens removed from onboarding).
- Online / last-seen presence.
- Nested Reddit-style comment threads (v1 is Instagram-style: one level of replies under a comment).

---

## Smaller follow-ups (not blocked, not done)

- Pagination / “load more” for classmates, board, chat history, activity.
- Chat “delivered” only updates when the other person’s app is open or they fetch the thread (no push yet, so it won’t tick delivered if they’re fully quit).
- Report emails open the mail app; rows also land in `reports` for you to query in Supabase. No in-app moderation queue.
- Support / “Report a Problem” opens mailto `studysesh.cu@gmail.com`.

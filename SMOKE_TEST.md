# Deployed smoke test

Run against a disposable staging project and two consented test accounts before a production rollout. Use real eligible email inboxes where email verification is required. Never record passwords, tokens, private documents or personal information in results. Record the app version, migration versions, platforms, date and pass/fail for each check.

## Preparation

- Confirm the target project, app URL, production-mode environment settings, migrations `001`–`030`, deployed Edge Functions, Auth redirects and private `proofs`/private `avatars` bucket policies.
- Deploy the client and database together: migration `009` changes tutor reads, and the new client needs its RPCs.
- Use two accounts with a shared course. Set one profile to women/non-binary visibility and use viewers with both eligible and ineligible genders. Prepare a small image or PDF test proof with no personal information.

## Accounts and courses

- [ ] Sign up, receive/verify email, complete onboarding and reload. Confirm the selected courses, prompts, photo, visibility and pricing persist.
- [ ] Check password reset and email-change confirmation links. Before confirmation, the profile must retain the old verified email; after confirmation, Auth and the private profile email must match. Another user must not be able to query the email column. Edit profile and courses, then reload.
- [ ] As a student, choose **Become a Tutor**. Select a real course; confirm empty selection cannot continue. Upload proof, choose prices and finish; reload and check student courses are preserved. Switch between student and tutor modes.
- [ ] Force a proof upload or conversion failure and verify the error is visible and the flow can be retried. Test files at and above 10 MiB and a disallowed type. Confirm another user cannot read a proof path through tutor listings or download the private object.

## Social and privacy

- [ ] Discover a shared-course classmate. Send, review, cancel, resend, accept and decline requests. Test a cancellation/acceptance race; no accepted connection should be removed by a late cancel.
- [ ] With more than 30 eligible classmates, load subsequent pages and verify each person appears once, blocked/restricted/connected people stay hidden, and retry works after a network failure.
- [ ] With more than 30 activities, load older entries, then generate an activity on the other account. Confirm loaded entries remain, the new entry appears once, and the total unread count is accurate.
- [ ] Post, comment and like; verify both accounts see the expected updates and write failures preserve drafts.
- [ ] With more than 30 posts and comments, load every page and check counts and replies. Confirm authorized inserts, deletions and likes update live, blocked/ineligible viewers do not receive their events, and reconnecting prompts a refresh.
- [ ] Confirm an ineligible viewer cannot read the restricted profile, prompts, enrollments, tutor listing, posts or comments using either the app or direct authenticated API requests. An eligible viewer should see allowed data.
- [ ] Confirm anonymous, blocked and ineligible viewers cannot mint an avatar URL. Verify eligible viewers and an onboarding owner can display avatars on web and native, legacy public references still resolve, and old public/cache URLs are no longer usable. A URL issued before a block can remain valid until its five-minute expiry.
- [ ] Block in each direction and verify profile, tutor listing and existing conversation visibility; both sides must be unable to send messages while blocked. Unblock and verify expected access returns. Check the blocker's blocked-user list still displays names.
- [ ] Send messages, reload, and check sent/delivered and unread states. With more than 50 messages and 30 conversations, load older pages, retry after a network failure and verify the full unread count.
- [ ] Hide a conversation on one account. Verify it remains on the other account, reopens for the hiding user on a new message, preserves history, and reuses the same thread if either account explicitly opens it again. Concurrent creation must not create duplicates.
- [ ] Submit a report with a reason; simulate failure and verify the reason remains available for retry. Confirm an explicitly provisioned moderator sees the reason and can review or dismiss it and that the decision is audited; a non-moderator must not see the queue or resolve reports. Closing a report must not change the reported account.

## Release checks

- [ ] Run `npm run test:db` for the isolated mocked database checks, then run the SQL regression scripts under `supabase/tests/` in a disposable Supabase database after applying migrations. Run `npm run build:web`, `npm run typecheck` and `npm test`. Test native builds and push after completing [PUSH_SETUP.md](./PUSH_SETUP.md); the feature is disabled by default.
- [ ] Delete both test accounts and verify their user data and nested avatar/proof storage cleanup. Test a storage failure and retry; confirm uploads are blocked during deletion and recover after a failed attempt. Verify another user's activity and conversation remain consistent. Document any failed step and whether a deployment was rolled back.

# Push notification deployment

The implementation is disabled by default. Do not enable the public build flag until the backend worker and native credentials are configured and tested. Never paste secrets or device tokens into chat, source files, or logs.

## What is implemented

- On iOS and Android, account-level message, connection and board preferences default to off. Enabling a category requests device permission and registers an Expo push token. Web and demo builds do not offer push controls.
- Activity events enqueue one delivery per registered device. The worker uses generic notification text and an activity ID, not message content or names. It rechecks current preferences, blocks and account deletion before sending.
- Delivery is **at least once**: a timeout after Expo accepts a notification can cause a retry and duplicate notification. Expo tickets are checked for receipts, unregistered devices are removed, transient failures retry with backoff, and terminal failures are retained for 30 days.

## Owner-controlled setup

1. Apply migrations through `029` in a disposable staging project and deploy all matching Edge Functions and the client together, following [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md).
2. Create/link the Expo EAS project and configure `extra.eas.projectId` through the Expo project setup. Register the intended iOS bundle identifier and Android application ID. The checked-in `eas.json` provides internal preview and production profiles, but the owner must configure identifiers, signing and store credentials. Configure APNs credentials and FCM v1 credentials in Expo, and produce native builds.
3. Generate a strong random `PUSH_WORKER_SECRET` of at least 32 characters and set it as a Supabase Edge Function secret. If Expo enhanced push security is enabled, set `EXPO_ACCESS_TOKEN` as a separate Edge Function secret. Neither belongs in an `EXPO_PUBLIC_` variable.
4. Deploy `push-worker` with JWT verification disabled as configured in `supabase/config.toml`. It rejects requests unless the `x-push-worker-secret` header matches the server secret. Configure a trusted scheduler to send a `POST` to the function approximately once per minute with that header, storing the secret in the scheduler's secret manager. Do not put the secret in a URL or repository.
5. Test worker access without the header and with an incorrect header; both must be rejected. Monitor scheduler failures and the counts of `pending`, `receipt`, and `failed` rows in `public.push_deliveries` using an authorized administrative connection. The worker claims at most 50 jobs per invocation; increase scheduling frequency or run multiple workers if backlog grows. A failed worker leaves leases to expire and retry.
6. Only after end-to-end testing, set `EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true` for the native build environment and rebuild. Leave it false for unconfigured builds. The flag is not a secret.

## Device acceptance checklist

- [ ] On test iOS and Android devices, deny permission and confirm the preference remains off with a clear error.
- [ ] Grant permission and enable each category. Confirm preferences persist across devices and reopening the app.
- [ ] Generate a message, connection request/acceptance, and board like/reply from another account. Confirm each enabled category delivers a generic notification and tapping it opens Activity.
- [ ] Turn off a category, read the activity, block the sender, sign out, switch accounts, and delete an account. Confirm queued sends are suppressed where applicable and device tokens are removed or reassigned.
- [ ] Exercise foreground, background and terminated states, reconnect after a network failure, and verify an Expo receipt eventually changes the delivery to `delivered`. Verify a `DeviceNotRegistered` receipt removes that device.
- [ ] Verify missing or invalid worker secrets fail closed, and inspect failed jobs without exposing tokens or personal data. Retry or explicitly resolve terminal failures after correcting configuration.

Changing preferences or blocking cannot retract a notification already accepted by Expo or a platform provider. Signed-out cleanup can also fail offline; the app warns when it cannot unregister the device.

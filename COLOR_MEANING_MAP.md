# studysesh colour meaning map

Snapshot of colours as they exist in the live app (`components/`, `app/`). Hexes are copied from StyleSheets, Lucide `color` props, and Tailwind v3 defaults where the code uses class names (`bg-yellow-100`, etc.).

There is no shared token file. `lib/theme.tsx` only stores `'light' | 'dark'`. The same meaning can use different hexes on different screens.

---

## Session type

| Meaning | Component | Text | Fill | Dark text | Dark fill |
|---|---|---|---|---|---|
| 1-on-1 | `DayAvailabilityCard` | `#15803D` | `#F0FDF4` | `#15803D` | `rgba(21, 128, 61, 0.2)` |
| Group | `DayAvailabilityCard` | `#1D4ED8` | `#EFF6FF` | `#1D4ED8` | `rgba(29, 78, 216, 0.2)` |
| 1:1 price | `PricingBubble` | `#15803D` | `#C8E6C9` | `#86EFAC` | `#14532D` (`bg-green-900`) |
| Group price | `PricingBubble` | `#2563EB` (`text-blue-600`) | `#D5E2F6` | `#93C5FD` (`text-blue-300`) | `#1E3A8A` (`bg-blue-900`) |
| 1:1 slider | `TutorPricingSetupScreen` / `PricingEditorScreen` | thumb `#22C55E` | well `#DCFCE7` | icon `#86EFAC` | well `#14532D` |
| Group slider | same | thumb `#3B82F6` | well `#DBEAFE` | icon `#93C5FD` | well `#1E3A8A` |
| 1:1 slider label | same | `#15803D` | — | `#86EFAC` | — |
| Group slider label | same | `#1D4ED8` | — | `#93C5FD` | — |

---

## Location

These two components do **not** share a palette.

| Meaning | Component | Text | Fill | Dark text | Dark fill |
|---|---|---|---|---|---|
| Online | `DayAvailabilityCard` | `#C2410C` | `#FFF7ED` | `#C2410C` | `rgba(194, 65, 12, 0.2)` |
| In-person | `DayAvailabilityCard` | `#7E22CE` | `#FAF5FF` | `#7E22CE` | `rgba(126, 34, 206, 0.2)` |
| Online | `LocationBadge` | `#854D0E` (`yellow-800`) | `#FEF3C7` (`yellow-100`) | `#FCD34D` (`yellow-300`) | `#713F12` (`yellow-900`) |
| In-person | `LocationBadge` | `#9A3412` (`orange-800`) | `#FFEDD5` (`orange-100`) | `#FDBA74` (`orange-300`) | `#7C2D12` (`orange-900`) |

---

## Status / success

| Meaning | Component | Icon / text | Fill | Dark |
|---|---|---|---|---|
| Active / enrolled | Home course row | `#22C55E` | — | same |
| Connect succeeded | `ProfileCard` | white on `#22C55E` | `#22C55E` | same |
| Already friends | `ProfileCard` | white on `#9CA3AF` | `#9CA3AF` | same |
| Proof uploaded | `TutorProofUploadScreen` / `CourseInputModal` | `#16A34A` check; `#15803D` / `#16A34A` text | `#F0FDF4`, border `#22C55E` | text `#4ADE80` (`green-400`); fill `green-900` @ 20% (`#14532D` @ 20%) |
| Password rule met | `ChangePasswordScreen` | `#16A34A` | `#16A34A` | same on the check pill |
| Notification accepted | `NotificationsScreen` | `#22C55E` | `#DCFCE7` (`green-100`) | fill `green-900` @ 30% |
| Notification reminder | `NotificationsScreen` | `#3B82F6` | `#DBEAFE` (`blue-100`) | fill `blue-900` @ 30% |
| Warning (email code) | `CodeVerificationScreen` | `#854D0E` (`yellow-800`) | `#FEFCE8` (`yellow-50`) | text `#FDE047` (`yellow-200`); fill `yellow-900` @ 20% |

---

## Brand / chrome

| Meaning | Hex | Also used as |
|---|---|---|
| Primary / CTA / like / logout | `#DB2321` | Gradient start; web `themeColor` |
| Gradient mid | `#A01A18` | Tab pill, send button |
| Gradient deep | `#500908` | Home header |
| Tailwind stand-in for primary | `#DC2626` (`red-600`) | Sign-in buttons and other `bg-red-600` / `text-red-600` |
| Destructive | `#EF4444` | Unfriend / remove |
| Page (light) | `#FFFFFF` | Splash, cards, Android icon background |
| Page (dark) / body text (light) | `#111827` | Both jobs |
| Dark cards | `#1F2937` | Elevated surfaces |
| Dark borders | `#374151` | Dark chrome |
| Body text (dark) | `#F3F4F6` | Primary text on dark pages |
| Muted text | `#6B7280` | Secondary copy |
| Placeholder / idle icon | `#9CA3AF` | Most common hex in the repo |
| Border (light) | `#E5E7EB` | Light chrome |
| Subtle fill (light) | `#F3F4F6` / `#F9FAFB` | Gray wells |
| Avatar / red wash | `#FEE2E2` | Icon wells; initials often `#991B1B` |
| Lightest red wash | `#FEF2F2` | Selected / liked backgrounds |
| Dark-mode red well | `#450A0A` | Borders often `#7F1D1D` |
| Course code on dark | `#FCA5A5` | Home / course rows |

---

## Collisions (same meaning, different paint)

| Meaning | Palette A | Palette B |
|---|---|---|
| Online | `#C2410C` on `#FFF7ED` (availability chip) | `#854D0E` on `#FEF3C7` (location badge) |
| In-person | `#7E22CE` on `#FAF5FF` (availability chip) | `#9A3412` on `#FFEDD5` (location badge) |
| Success / “on” | `#22C55E` (dot, connect, accepted, 1:1 slider) | `#16A34A` (checks, password, proof text) |
| Primary red | `#DB2321` (brand hex) | `#DC2626` (Tailwind `red-600`) |
| `#111827` | Light-mode body text | Dark-mode page background |

Green `#22C55E` is both “session 1:1” and “generic success.”

# UI rebrand plan

Fonts and colours only. Same screens, same layout, same taps.

Brand red stays `#DB2321`. What changes is the paper around it, a separate danger colour, and two real fonts instead of the system font.

---

## 1. Current state

There is no palette. `tailwind.config.js` has `theme.extend` set to `{}` and `darkMode: "class"`. `lib/theme.tsx` only stores `'light' | 'dark'` (`ThemeProvider`, `useAppTheme`, `useIsDark`). It does not hold colours. `global.css` is the three Tailwind lines. `app.json` sets `web.themeColor` to `#db2321`. Splash, web background, and the Android adaptive icon background are `#ffffff`. There are no `.ttf` / `.otf` files and no `expo-font` or `@expo-google-fonts/*` dependency. Every `Text` is the platform system font (`font-bold` / `fontWeight: '700'`).

Colour lives in three places that do not share values:

| Where | What it uses |
| --- | --- |
| NativeWind `className` | `bg-red-600`, `text-red-600`, `bg-white`, `bg-gray-900`, `text-gray-500`, `dark:text-white`, `border-gray-200` |
| `StyleSheet` hexes | `#db2321`, `#111827`, `#fee2e2`, `#991b1b`, `#1f2937`, `#f3f4f6`, `#6b7280`, `#9ca3af` |
| One-off props | Lucide `color="#db2321"`, `LinearGradient` stops, `shadowColor`, `app/index.tsx` root background |

`red-600` is `#DC2626`. The brand hex is `#DB2321`. They are not the same number. Buttons, links, progress bars, likes, and Log Out all use one or the other, so primary and destructive are the same red.

The same hex also means two different things:

- `#111827` is body text on Home and Profile in light mode, and the page background in dark mode (`StudentHomeScreen` `containerDark`, `app/index.tsx` `SafeAreaView`).
- `#ffffff` is the light page background and the text on the red header.
- `#991b1b` is avatar initials on `#fee2e2` (fine) and, in `StudentProfileScreen`, the dark-mode menu icon colour on a `#111827` page (too dark to read). Dark icon wells on that screen stay `#fee2e2`, a light-mode sticker on a dark card.

Dark mode itself is three mechanisms at once. `app/index.tsx` passes `isDarkMode={theme === 'dark'}` into almost every screen, calls `nativewindColorScheme.set(theme)`, and on web toggles the `dark` class on `documentElement`. Some screens then use `dark:` classes, some use `theme === 'dark' ? '#111827' : '#fff'`, some use both (`StudentProfileScreen`: `className` for the page, `StyleSheet` for everything inside). Welcome does not take `isDarkMode` at all. Its background is the gradient in `RippleBackground` (`#db2321` → `#a01a18`).

A screen-by-screen paint job fails for that reason. Recolouring Home’s StyleSheet does nothing to Sign In’s `bg-red-600`. Recolouring Tailwind does nothing to StyleSheet or to `color="#db2321"` on icons. Find-and-replace of `#111827` will paint body text with the page background, or the page with the text colour, depending on which occurrence you hit. `theme.extend` is empty, so there is no `bg-brand` to move toward. Copies under `_source/`, `_figma-social/`, `backup/`, `archive/`, and `animation/` repeat the old hexes and are not what `app/index.tsx` renders.

Live styling is split by screen, which is why the first migrations are those three:

- **Welcome** is `className` text on `RippleBackground`, plus `AnimatedButton` (white or red `LinearGradient`, label `#db2321`).
- **Home** (`StudentHomeScreen`, and `TutorHomeScreen` beside it) is almost entirely `StyleSheet`: header gradient `#db2321` → `#500908`, page `#fff` / `#111827`, cards `#fff` / `#1f2937`, course code `#db2321` / `#fca5a5`.
- **Profile** (`StudentProfileScreen`, `TutorProfileScreen`) mixes `bg-white` / `bg-gray-900` with a large StyleSheet (avatar `#fee2e2` / `#991b1b`, menu borders `#f2d0d0`, logout the same red as the brand).

The root frame is a third background: `app/index.tsx` sets `SafeAreaView` to `'white'` or `'#111827'`. If a screen changes and that line does not, you get a seam.

Leave `#22c55e` alone. That dot means “active” on the course row. It is not a brand colour.

---

## 2. Brand direction

Campus study app, casual name, red already in the welcome gradient, the tab pill, course codes, and `themeColor`. Keep that red. Shift the chrome from default Tailwind gray to warm paper and warm ink so it stops looking like an unstyled starter with a red button.

**Rejected:** moving the brand to navy, indigo, or forest green. Those read as a different product (generic education SaaS, or a “focus app”). The red is the part that already says studysesh. Unifying on Tailwind `red-600` was also rejected: that is Tailwind’s default danger red, which is why Log Out and Get Started match today. The custom hex is the one to keep.

### Fonts

Two families, both on Google Fonts, both loaded with `expo-font` and the `@expo-google-fonts` packages.

| Role | Family | Cuts to load | Where |
| --- | --- | --- | --- |
| Display | **Fraunces** | `Fraunces_700Bold` | Welcome wordmark (`text-5xl`) and the large name on Home (`fontSize: 32`). Nowhere else. |
| UI | **Source Sans 3** | 400, 500, 600, 700 | Every other `Text`. |

Fraunces is a soft serif. At display size it fits a lowercase name on a campus poster. It is a poor body font at 13px, so it stays on those two spots. Source Sans 3 is a humanist sans that stays readable in course stats, settings rows, and chat. The weights match what the app already asks for: `font-medium`, `font-semibold` / `fontWeight: '600'`, and `font-bold` / `fontWeight: '700'`.

System font stays rejected because iOS and Android already disagree and the type has no relationship to the red. Inter, DM Sans, and Plus Jakarta Sans were rejected because they are the current SaaS default. Poppins was rejected because it reads as a generic student-app template. A second serif for body text was rejected because two serifs at UI size get noisy.

React Native does not pick a bold file from `fontWeight` the way CSS does. Load the four Source Sans cuts and the one Fraunces cut as separate font family names. On a StyleSheet title, set `fontFamily: 'SourceSans3_700Bold'` (or Fraunces for the two display spots). Do not rely on `fontWeight: '700'` to fake it, and do not leave `fontWeight: '700'` on an already-bold file or iOS will faux-bold it again. Set `fontWeight` back to `'400'` once the family name is the bold cut.

Do not name a Tailwind font family `bold` or `semibold`. Those class names already belong to `fontWeight`, and the two utilities collide. Use `font-sans`, `font-sans-medium`, `font-sans-semibold`, `font-sans-bold`, and `font-display`.

---

## 3. Tokens

One module, `lib/colors.ts`. Do not put these in `lib/theme.tsx`. That file stays the light/dark switch.

JS keys below are the API (`palette.light.text`). Tailwind class names are in the next section, because `text-text` is a bad class.

### Light

| Token | Hex | Replaces |
| --- | --- | --- |
| `bg` | `#F6F1EA` | `#fff` / `bg-white` page backgrounds |
| `surface` | `#FFFCF8` | `#fff` cards on the page |
| `border` | `#E5D9CE` | `#e5e7eb`, `#f2d0d0`, `border-gray-200` |
| `text` | `#1C1614` | `#111827`, `text-gray-900` when it means ink |
| `textMuted` | `#6B615A` | `#6b7280`, `text-gray-500` |
| `brand` | `#DB2321` | `#db2321` and `bg-red-600` / `text-red-600` on primary actions, links, likes, progress, course codes |
| `brandSoft` | `#FDE8E6` | `#fee2e2`, `#fef2f2` wells, avatar, chips |
| `brandInk` | `#8E1A18` | `#991b1b` text and icons on `brandSoft` |
| `danger` | `#9A3412` | Log Out, Delete account, destructive confirms. Not primary buttons. |

`textMuted` on `bg` is about 5.4:1. White on `brand` stays as it is today (large button labels). `brandInk` on `brandSoft` is the small-text pair (avatar initial, chip label).

### Dark

| Token | Hex | Replaces |
| --- | --- | --- |
| `bg` | `#141110` | `#111827` page backgrounds |
| `surface` | `#221C19` | `#1f2937` / `bg-gray-800` cards |
| `border` | `#3A312B` | `#374151` / `border-gray-700` |
| `text` | `#F6F1EA` | `#f3f4f6`, `text-white` body copy |
| `textMuted` | `#A8988C` | `#9ca3af` |
| `brand` | `#DB2321` | Button fills. Label on the fill stays white. |
| `brandSoft` | `#3C1816` | Dark icon wells and avatar. Replaces `#fee2e2` used on dark cards. |
| `brandInk` | `#F6B7B4` | Icons and course codes on dark surfaces. Replaces `#991b1b` (too dark) and `#fca5a5`. |
| `danger` | `#FF8A6A` | Destructive label and icon on dark pages. |

### Extra stops already in the app

Keep these in the same file so gradients are not leftover hexes. They are not a new colour.

| Token | Hex | Where it already is |
| --- | --- | --- |
| `brandDeep` | `#A01A18` | Tab pill, `RippleBackground`, several gradients (`#db2321` → `#a01a18`) |
| `brandAbyss` | `#500908` | Home header gradient end |

Labels on brand fills stay `#FFFFFF`. Do not add a token for the active dot (`#22c55e`).

Paper (`#F6F1EA`) is the one taste call. If it should stay pure white, change only light `bg` and light `surface` to `#FFFFFF` and the splash colour with them. Everything else still holds.

---

## 4. Implementation order

Do the plumbing before any screen. A screen edit that hardcodes the new hexes recreates the current mess.

### 4.1 `lib/colors.ts`

```ts
export const palette = {
  light: {
    bg: '#F6F1EA',
    surface: '#FFFCF8',
    border: '#E5D9CE',
    text: '#1C1614',
    textMuted: '#6B615A',
    brand: '#DB2321',
    brandSoft: '#FDE8E6',
    brandInk: '#8E1A18',
    danger: '#9A3412',
    brandDeep: '#A01A18',
    brandAbyss: '#500908',
  },
  dark: {
    bg: '#141110',
    surface: '#221C19',
    border: '#3A312B',
    text: '#F6F1EA',
    textMuted: '#A8988C',
    brand: '#DB2321',
    brandSoft: '#3C1816',
    brandInk: '#F6B7B4',
    danger: '#FF8A6A',
    brandDeep: '#A01A18',
    brandAbyss: '#500908',
  },
} as const;
```

Screens that already take `isDarkMode` keep that prop:

```ts
const c = isDarkMode ? palette.dark : palette.light;
```

Do not spend this pass deleting the prop in favour of `useIsDark()`. Both can read the same object. `useIsDark()` is already what `SkeuomorphicCoursePicker` and `PronounSelector` use.

### 4.2 `tailwind.config.js` → one source of hexes

Tailwind 3.4 can load a TypeScript config. Rename to `tailwind.config.ts` and import `palette` from `lib/colors.ts`. Do not paste the hexes a second time. If Expo fails to load the TS config, switch the source to a plain `lib/colors.js` (`module.exports = { palette }`) and re-export it from `lib/colors.ts`. Still one object.

`darkMode: "class"` already matches `nativewindColorScheme.set` and the web `dark` class in `app/index.tsx`. Use paired utilities, not CSS variables. Variables would be a second copy, and StyleSheet plus Lucide `color=` cannot read them.

Map tokens to classes like this:

| Token | Light class | Dark class |
| --- | --- | --- |
| `bg` | `bg-bg` | `dark:bg-bgDark` |
| `surface` | `bg-surface` | `dark:bg-surfaceDark` |
| `border` | `border-line` | `dark:border-lineDark` |
| `text` | `text-ink` | `dark:text-inkDark` |
| `textMuted` | `text-muted` | `dark:text-mutedDark` |
| `brand` | `bg-brand` / `text-brand` | same fill; `dark:text-brandInk` when the red is a label on a dark page |
| `brandSoft` | `bg-brandSoft` | `dark:bg-brandSoftDark` |
| `brandInk` | `text-brandInk` | `dark:text-brandInkDark` |
| `danger` | `text-danger` | `dark:text-dangerDark` |

`border` is named `line` in Tailwind so it does not fight the `border` width utilities. JS key stays `border`.

Font families in the same `theme.extend`:

```js
fontFamily: {
  sans: ['SourceSans3_400Regular'],
  'sans-medium': ['SourceSans3_500Medium'],
  'sans-semibold': ['SourceSans3_600SemiBold'],
  'sans-bold': ['SourceSans3_700Bold'],
  display: ['Fraunces_700Bold'],
}
```

### 4.3 Default font in `app/_layout.tsx`

`_layout.tsx` is the right place. It mounts before `app/index.tsx`. Do not move `ThemeProvider` while doing this.

```bash
npx expo install expo-font @expo-google-fonts/fraunces @expo-google-fonts/source-sans-3
```

Load `Fraunces_700Bold`, `SourceSans3_400Regular`, `SourceSans3_500Medium`, `SourceSans3_600SemiBold`, and `SourceSans3_700Bold` with `useFonts` from `expo-font`. `expo-splash-screen` is already a plugin. Call `SplashScreen.preventAutoHideAsync()` until the fonts resolve, then hide. `expo-font` is not a direct dependency today (it only shows up transitively).

NativeWind does not apply `font-sans` to a `Text` that has no class. Add this to `global.css` so className text (Welcome, Settings, most onboarding) inherits Source Sans 3:

```css
@layer base {
  * {
    font-family: SourceSans3_400Regular;
  }
}
```

Check that on iOS and Android, not only web. StyleSheet text that sets `fontWeight` and no `fontFamily` will not switch cuts by itself. When a screen is migrated, set the family name on those styles in the same edit. `font-display` only on the wordmark and the Home name.

Do not use `Text.defaultProps` as the plan. On React 19 / RN 0.86 it is not something to count on.

### 4.4 Screens, in this order

After fonts load, the app can still show the old colours. That is expected. Then migrate:

1. **Welcome.** `WelcomeScreen`: add `font-display` on the wordmark only. Tagline and the sign-in line stay Source Sans. `AnimatedButton`: brand and white from the palette (primary label `brand`, secondary gradient `brand` → `brandDeep`). `RippleBackground`: `brand` → `brandDeep`. Do not touch the floating-card motion in `ZeroGravityTutorCards`.
2. **Home.** `StudentHomeScreen` and `TutorHomeScreen`. Page `bg`, cards `surface`, borders `border`, titles `text`, meta `textMuted`, course code `brand` / dark `brandInk`, header gradient `brand` → `brandAbyss`. The person’s name on the header is Fraunces. “Welcome back” and everything under it is Source Sans. In the same edit, point `app/index.tsx` `SafeAreaView` `backgroundColor` at `palette.light.bg` / `palette.dark.bg` or the home screen will sit in a white or `#111827` frame.
3. **Profile.** `StudentProfileScreen` and `TutorProfileScreen`. Avatar and icon wells `brandSoft` + `brandInk` (dark wells use dark `brandSoft`, not `#fee2e2`). Name is Source Sans bold, not Fraunces. Log Out is `danger`. Menu rows stay the same shape.
4. **Tab bar, next,** because it is on screen with Home and Profile. `NewNavigationTabs` and `TutorNavigationTabs`: active pill `brand` → `brandDeep`, inactive pill `surface` / a muted fill from `border`, inactive icon `textMuted`. Do not rebuild the animation.
5. **Onboarding forms** that are `bg-red-600` primary buttons: Sign in, Sign up, code verification, profile basics, prompts, course selection, tutor application, proof upload, pricing setup, forgot password. Primary fill becomes `bg-brand`. Progress bars that are `bg-red-600` become `bg-brand`.
6. **The rest of the live tree:** chat (`ChatListScreen`, `IndividualChatScreen`, and the bubbles / input they render), classmates, activity, course detail, post detail, settings and the profile overlays, connections, edit profile. `reference/AnimatedTabs.tsx` is mounted by course detail, my courses, and pricing. It is live. Recolour it when those screens are done. It is not under `components/`, and it is not archive.

While swapping classes:

- `bg-red-600` on a primary button → `bg-brand`
- `text-red-600` on a link or emphasis → `text-brand`
- `text-red-600` on Log Out / Delete → `text-danger` (and `dark:text-dangerDark`)
- `bg-white` page → `bg-bg dark:bg-bgDark`
- `bg-white` card → `bg-surface dark:bg-surfaceDark`
- `text-gray-900` → `text-ink dark:text-inkDark`
- `text-gray-500` → `text-muted dark:text-mutedDark`
- `font-bold` on className text → `font-sans-bold` (drop the weight utility on that node)
- Lucide `color` and `LinearGradient` `colors` take the JS token, not a class

### 4.5 `app.json` when paper ships

`themeColor` stays `#DB2321`. Set splash `backgroundColor`, `web.backgroundColor`, and Android `adaptiveIcon.backgroundColor` to light `bg` (`#F6F1EA`) so launch is not a white flash. Leave `userInterfaceStyle` as `"light"`. The in-app toggle is separate.

### Do not touch

- `_source/`, `_figma-social/`, `backup/`, `archive/`, `animation/`
- Files under `components/` that nothing in the `app/index.tsx` import tree reaches (`PaymentMethodsScreen`, `PhoneInputScreen`, `LanguageSelectionScreen`, old `NavigationTabs`, `TutorChatScreen`, `TutorStudentsScreen`, and similar). Grep from `app/index.tsx` before editing. If it is not in that tree, skip it until the live tree is done.
- The active dot `#22c55e`

---

## 5. You vs a later agent

**You**

- Say whether this palette and these two fonts are accepted. The only likely veto is paper vs pure white (section 3).
- After Welcome, Home, and Profile exist in both themes, look at them on a phone. Say if Fraunces on the wordmark and the Home name is too much. If it is, those two strings go back to Source Sans bold and Fraunces is dropped. No other font decision is needed.
- The app icon PNG can stay. The red did not change. You do not need to redraw it for this pass.

**An agent later**

- Install the font packages, add `lib/colors.ts`, point Tailwind at it, load fonts in `app/_layout.tsx`, then recolour in the order in section 4.
- Replace hexes and red/gray classes on live files only. Keep props, copy, navigation, and component structure.
- Update the three `app.json` background hexes when light `bg` changes.
- Show Welcome, Home, and Profile in light and dark before continuing down the list.
- Do not commit unless you ask.

---

## 6. Out of scope

- Layout, spacing, border radius, shadows’ size (shadow *colour* may move to `brand` where it is already `#db2321`)
- Motion, transitions, haptics (`AnimatedButton` and `ZeroGravityTutorCards` keep their animation)
- New components, a shared `Button`, or folding StyleSheet into `className` for its own sake
- Reworking how `isDarkMode` is passed
- Copy, icons, empty states, onboarding flow
- Deleting `_source`, backup, or archive

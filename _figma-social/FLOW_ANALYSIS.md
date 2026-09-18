# Social App Flow Analysis (UPDATED)

Based on the Figma exports + your feedback. This is the source of truth.

---

## 🧭 Navigation Structure (5 Tabs)

| Tab | Icon | Purpose |
|-----|------|---------|
| **Home** | Home | Course-based view — your enrolled courses |
| **Messages** | MessageSquare | Chat with other students/connections |
| **Classmates** | Users | **Swipe-based discovery** of other students (centerpiece) |
| **Activity** | Bell | Notifications — replaces old bell icon entirely |
| **Profile** | User | Your profile + settings + connections list |

---

## 📱 Screen-by-Screen Flow

### HOME TAB

```
Home Screen
├── Header: "Hey there, [Name]" + status badge ("Cramming")
├── "Your Courses" list
│   └── CourseCard (SYSC 2006, COMP 2402, etc.)
│       ├── Active discussions count
│       └── Total students count
└── Tap a course → Course Detail Screen
```

**Course Detail Screen** (inside a course):
```
Course Detail Screen
├── Back button + course name
├── Tab Bar: "The Board" | "Tutors"
│
├── [The Board tab]
│   ├── Post Composer (write post, mark as question)
│   └── Posts Feed
│       └── PostCard (author, content, likes, comments, question badge)
│       └── Tap author → View their profile (with gender restrictions, see below)
│
└── [Tutors tab]
    └── TutorCard list (tutors for this specific course)
        └── Each card has MESSAGE button (no booking, just DM)
```

**Profile viewing from posts (gender restrictions):**
- Women/Non-binary users → can be viewed by other women/non-binary only
- If a guy tries to tap their profile → toast message "You can't view this profile"
- When you CAN view a profile, it looks exactly like the ProfileCard in Classmates

---

### MESSAGES TAB

```
Messages Screen (existing ChatListScreen)
└── Tap conversation → Individual Chat Screen
```

**Note:** Keep existing implementation — it works great.

---

### CLASSMATES TAB ⭐ (Main Discovery Feature)

```
Classmates Screen
├── NO progress indicator (keeps curiosity alive)
├── Swipeable ProfileCard stack
│   ├── Photo + name + pronouns
│   ├── Year + Major
│   ├── Personality prompts (e.g., "I study best at...", "I'm always down to...")
│   └── "Connect" button
├── Swipe UP → next student
└── Swipe DOWN → previous student
```

**What "Connect" does:**
1. Sends a connection request to the other user
2. Request appears in their **Activity** tab
3. They can **Accept** or **Decline**
4. If accepted → both are added to each other's **Connections list** (viewable in Profile)
5. Works like OG BeReal friends system

**Who appears in Classmates:**
- Students who share at least one course with you
- NOT tutors of your courses (they're only visible in Tutors tab)
- Tutors see their own classmates from courses they're TAKING (not tutoring)

---

### ACTIVITY TAB (Replaces Bell Icon)

```
Activity Screen
├── Header: "Activity" + "Mark all read"
├── Unread count
└── Activity items list
    ├── Connection requests received (Accept/Decline buttons)
    ├── Connection accepted notifications
    ├── New messages
    ├── Likes on your posts
    ├── Comments on your posts
    └── Mentions (if someone @'s you)
```

**NO tutor-related activity items** — students just message tutors directly.

---

### PROFILE TAB

```
Profile Screen
├── Avatar + Name + Pronouns + Year + Program
├── Menu items:
│   ├── Edit Profile
│   ├── My Courses
│   ├── Connections (NEW - list of accepted connections)
│   ├── Notifications (settings)
│   ├── Settings
│   └── About
│
│   [If user is also a Tutor, additional items:]
│   ├── My Tutoring Courses
│   ├── Pricing
│   └── (keep existing tutor profile stuff)
│
└── Logout button
```

---

## 🚀 Onboarding Flow (UPDATED)

```
1. Welcome/Splash Screen
      ↓
2. Role Selection: "Student" or "Student + Tutor"
      ↓
3. Sign Up (email + password)
      ↓
4. Code Verification (email or phone - see note below)
      ↓
5. Profile Basics
   • Full name
   • Pronouns (select up to 2)
   • Gender identity ← important for profile viewing restrictions
   • Year of study
   • Degree level
   • Major
      ↓
6. Profile Prompts (personality)
   • Select 3 prompts from list
   • Write answers (150 char max each)
   • Examples: "I study best at...", "I'm always down to..."
      ↓
7. Course Selection (courses you're TAKING)
      ↓
   [If "Student + Tutor" was selected:]
   8a. Tutor Course Selection (courses you can TUTOR)
   8b. Upload proof (transcript screenshot)
   8c. Set pricing + tutoring mode (online/in-person/both)
      ↓
9. Success → Enter App
```

**Returning users (Sign In):**
```
1. Welcome/Splash Screen
      ↓
2. Sign In (email + password)
      ↓
3. Code Verification (if needed)
      ↓
4. Enter App
```

---

## 📧 Verification Recommendation

**My recommendation: University email with fallback**

1. **Primary: University email (.edu / institution domain)**
   - Confirms they're actually a student
   - Show clear message: "Check your spam/junk folder if you don't see it"
   - Give them 60 seconds, then show "Didn't receive it?" button

2. **Fallback: Phone number (SMS)**
   - If email fails or they click "Try another method"
   - More reliable delivery
   - Doesn't confirm student status, but at least verifies real person

3. **Alternative approach:**
   - Require institutional email for SIGN UP (proves student status)
   - Allow phone verification for subsequent sign-ins (faster)

This way you get the best of both: confirmed students + reliable verification.

---

## 🔄 Key Changes from Old Tutoring App

| Old App | New Social App |
|---------|---------------|
| Home = Browse tutors | Home = Your courses + "The Board" discussions |
| Bookings tab | Activity tab (notifications) |
| Find tutor → Book session | Find classmates → Connect |
| Bell icon for notifications | Activity tab (no bell icon) |
| Tutor is separate role | Tutor is student + tutor merged |
| Role toggle in profile | No role toggle — tutors have extra menu items |
| 4 tabs | 5 tabs |
| Complex tutor scheduling | Simple: students just message tutors |

---

## 👥 How Tutors Work Now

1. **Tutors are students first** — they have their own courses they're taking
2. **Tutor is an add-on** — selected during onboarding OR can enable later in settings
3. **Tutors appear in "Tutors" tab** of courses they tutor
4. **Students message tutors directly** — no booking system
5. **Tutors can use Classmates** to meet students from courses they're TAKING (not tutoring)
6. **Tutor profile extras:** edit pricing, edit tutoring courses

---

## 📁 Components Summary

### NEW components to build (convert from Figma):
- `home/HomeScreen.tsx` - course-based home
- `home/CourseCard.tsx` - course list item
- `home/CourseDetailScreen.tsx` - course detail with Board + Tutors tabs
- `home/PostCard.tsx` - post in the board
- `classmates/ClassmatesScreen.tsx` - swipe discovery
- `classmates/ProfileCard.tsx` - student profile card
- `activity/ActivityScreen.tsx` - notifications/activity feed
- `NewNavigationTabs.tsx` - 5-tab navigation
- `onboarding/ProfileBasicsScreen.tsx` - detailed profile setup
- `onboarding/ProfilePromptsScreen.tsx` - personality prompts
- `onboarding/CodeVerificationScreen.tsx` - email/phone verification

### KEEP (existing RN components):
- All chat/messaging components
- TutorCard (for Tutors tab in course detail)
- Profile sub-screens (EditProfile, Settings, etc.)
- Tutor onboarding screens (course selection, proof upload, pricing)
- Most of the existing onboarding flow structure

### ARCHIVE (already done):
- BookingCard, CalendarPicker, TimeSlot, etc.
- Complex tutor scheduling stuff

---

## ✅ Confirmed Understanding

- [x] Classmates = main discovery, no search/filter
- [x] Profile tap from posts = gender-restricted
- [x] Connect = request → Activity → accept/decline → Connections list
- [x] The Board = public forum like D2L/Brightspace
- [x] Activity tab replaces bell icon entirely
- [x] Tutors = students with extra tutor capabilities
- [x] No role toggle
- [x] No progress indicator in Classmates
- [x] Students message tutors directly (no booking)
- [x] Tutor/Student choice is BEFORE sign up
- [x] Code verification after sign up

---

## 🔨 BUILD INSTRUCTIONS (DO NOT IGNORE)

Figma designs are reference only — build intuitively using our existing design system.

### General Rules
- **DO NOT copy Figma pixel-for-pixel** — use existing RN components/styles as the baseline
- **Buttons must match existing app buttons** — not Figma's button styles
- **Keep the existing design language** — Figma is for concepts, not final UI

---

### ProfileBasicsScreen (Complete Profile)
- **Gender identity:** Use toggle buttons EXACTLY like existing pronouns work (not Figma's broken version)
- **Degree level + Major:** Make these **text inputs** (not dropdowns) — same style as the Name input
- **Pronouns:** Keep existing implementation
- **Year of study:** Can keep as a selector/dropdown

---

### Tutor Onboarding
- **IGNORE Figma's tutor onboarding screens entirely**
- Use the **existing React Native tutor onboarding** (course selection, proof upload, pricing)
- Just wire it into the new flow

---

### Home Header
- **Keep existing RN header** — do NOT bring over Figma's header
- **ADD:** The customizable status badge from Figma (e.g., "Cramming", "Night Owl")
- **REMOVE:** Bell icon (Activity tab replaces it)

---

### Course Detail Screen
- Figma version is pretty solid, use it as reference
- **Board/Tutors tab bar:** Must work exactly like existing "All/Upcoming/Past" AnimatedTabs from reference/
- **TutorCards:** Replace timing indicator with a **Message button**

---

### Messages Screen
- **DO NOT bring anything from Figma** except:
  - A "Tutors only" filter button
- **Keep entire existing messages implementation**

---

### Bottom Navigation Bar
- **Keep existing navbar** — animation, style, everything
- **Add Classmates button in the middle**
- **Classmates button behavior:**
  - Does NOT expand with text like other tabs when selected
  - Has its own cool selected state (maybe scale/glow) but no text expansion
  - Must not break existing tab animations

---

### Classmates ProfileCard (Based on Mock Image)
```
┌─────────────────────────────────┐
│                                 │
│     [LARGE PHOTO - 60% height]  │
│                                 │
│     ┌─────────────────────┐     │
│     │ Alex                │     │
│     │ 3rd Year - Software │     │
│     └─────────────────────┘     │
├─────────────────────────────────┤
│ COURSES                         │  ← Changed from "THE VIBE"
│ [SYSC 2006] [COMP 2402] [...]   │  ← Shared course bubbles
├─────────────────────────────────┤
│ MY TOXIC STUDY TRAIT IS...      │
│ Calculating the exact grade I   │
│ need on the final to pass 🤡    │  [+]
├─────────────────────────────────┤
│ [More prompts as you scroll]    │
├─────────────────────────────────┤
│   Snap-scroll for next profile ↓│
└─────────────────────────────────┘

When scrolled to bottom:
[+] button EXPANDS into → [Connect +] button
```

- Snap-scroll vertically between profiles
- + button is floating, expands to "Connect +" when you've seen all prompts
- Photo takes up majority of top area with name/year/program overlay

---

### Activity Tab
- Figma version is fine as reference
- **Must handle navigation:** clicking a notification goes to the right place
  - Message notification → that conversation
  - Connection request → show accept/decline (or go to their profile?)
  - Like/comment → that post

---

### Settings
- **Keep existing RN settings entirely**
- Do NOT bring anything from Figma

---

## ✅ Build Checklist

1. [ ] Update NavigationTabs to 5 tabs with special Classmates button
2. [ ] Create HomeScreen with status badge + course list
3. [ ] Create CourseCard component
4. [ ] Create CourseDetailScreen with Board/Tutors tabs
5. [ ] Create PostCard for The Board
6. [ ] Add Message button to TutorCard
7. [ ] Create ClassmatesScreen with snap-scroll
8. [ ] Create ProfileCard matching the mock
9. [ ] Create ActivityScreen with proper navigation
10. [ ] Update ProfileBasicsScreen (gender as toggles, degree/major as inputs)
11. [ ] Add ProfilePromptsScreen
12. [ ] Add CodeVerificationScreen
13. [ ] Add "Tutors only" filter to Messages
14. [ ] Add Connections screen to Profile
15. [ ] Wire up new onboarding flow
16. [ ] Remove bell icon from headers

---

Ready to build! 🚀
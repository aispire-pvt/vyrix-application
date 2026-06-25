# Vyrix Frontend — Onboarding Flow Spec (All Pages)

## Overview

Build the complete **onboarding flow** for Vyrix — a research platform. This covers 5 screens in the `Login / Startup` section of Figma. React JS + Tailwind CSS, no Next.js, standard Vite + React setup.

The designs are taken directly from the Figma file: `https://www.figma.com/design/mtxT4Ux2foUfsTDkMNfnel/Vyrix-UI-Design`

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 (Vite) |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| State | React useState / useContext |
| Font | Unbounded (Google Fonts) + SF Pro (system fallback: -apple-system, BlinkMacSystemFont) |
| Icons | Use image assets from Figma (provided as URLs) |

---

## Project Structure

```
vyrix-frontend-sample/
├── public/
├── src/
│   ├── assets/          # logo, images
│   ├── components/
│   │   ├── ui/
│   │   │   ├── InputField.jsx
│   │   │   ├── Button.jsx
│   │   │   └── Divider.jsx
│   │   ├── onboarding/
│   │   │   ├── OnboardingSidebar.jsx   # reused left panel across all split-screen pages
│   │   │   └── StepButton.jsx          # individual step button (active/inactive states)
│   ├── pages/
│   │   ├── Login.jsx           # /login
│   │   ├── Signup.jsx          # /signup
│   │   ├── Profile.jsx         # /profile
│   │   ├── Tutorials.jsx       # /tutorials  (Desktop-4: skip state)
│   │   └── TutorialsNext.jsx   # /tutorials/next (Desktop-5: next state)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tailwind.config.js
├── vite.config.js
├── package.json
└── index.html
```

---

## Design Tokens (from Figma)

### Colors
```js
// Background
bg-black          → #000000  (page background)
bg-[#1e1e1e]      → #1e1e1e  (input fields background)

// Text
text-white        → #ffffff  (headings)
text-[#e1e1e1]    → #e1e1e1  (label text)
text-[#c7c7c7]    → #c7c7c7  (placeholder / secondary text)
text-[#b2c5f2]    → #b2c5f2  (link: "Log In" on signup page)
text-[#92a9e1]    → #92a9e1  (link: "Sign Up" on login page)

// Buttons
bg-white + text-black  → Primary CTA (Sign Up / Sign In)
border-[#6b6b6b]       → Google OAuth button border

// Input borders
border-[rgba(71,67,126,0.54)]  → standard input border
```

### Typography
```css
/* Headings */
font-family: 'Unbounded', sans-serif;
font-weight: 500; /* Medium */
font-size: 40px;

/* Body / Labels */
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif;
font-weight: 590; /* Semibold */
font-size: 16px;

/* Placeholders / Secondary */
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif;
font-weight: 400; /* Regular */
font-size: 16px;

/* CTA button text */
font-size: 20px;
font-weight: 590;

/* OR divider */
font-size: 20px;
font-weight: 274; /* Light */
```

### Spacing & Sizing
```
Input height: 60px
Input border-radius: 11px (rounded-[11px])
Button height: 60px
Button border-radius: 11px
Page: 1920×1080 (full screen desktop)
```

---

## Page 1: Signup Page (`/signup`) — Figma node 3:2

### Layout

Split screen — two columns side by side:

**Left Column (≈52% width, from x=30)**
- Background: dark image with overlay (`bg-[rgba(32,28,71,0.2)]` purple tint, `rounded-[54px]`)
- Vyrix logo (`image 5`) top-left area
- Large heading: `"Get Started with Us"` — `font-Unbounded, 40px, white, font-medium`
- Subtext: `"Complete these easy steps to get started with your research journey."` — `20px, #c7c7c7`
- Three onboarding step buttons at bottom:
  1. **"Sign up your account"** — white bg, black text, active/current step
  2. **"Set up your profile"** — dark bg (`#1e1e1e`), grey text, inactive
  3. **"Know about your workspace"** — dark bg, grey text, inactive
  - Each step button: `w-[389px] h-[60px] rounded-[11px] border border-[rgba(71,67,126,0.54)]`
  - Each has a small icon on the left (use Figma asset URLs)

**Right Column (≈48% width, from x=1198)**
- Subheading: `"Enter your personal details to create your account"` — `20px, #e1e1e1, center`
- Main heading: `"Sign up your Account"` — `40px, Unbounded, white, center`
- Form fields (top to bottom):
  1. **First Name** + **Last Name** — side by side, each `~206px / 219px wide`, `h-60px`, `bg-[#1e1e1e]`, `rounded-[11px]`
  2. **Email** — full width `434px`, `h-60px`, `bg-[#1e1e1e]`
  3. **Password** (`"Set up your password"`) — full width, with eye toggle icon (right side)
     - Helper text below: `"Must be at least 8 characters"` — `16px, #c7c7c7`
  4. **Sign Up** button — `w-full, h-[60px], bg-white, text-black, rounded-[11px], text-[20px], font-semibold`
  5. `"or"` divider with lines on each side
  6. **Google** button — `w-full, h-[60px], border border-[#6b6b6b], rounded-[11px]`, Google icon + "Google" text in white
- Footer: `"Already have an Account?"` + `"Log In"` link in `#b2c5f2`

### Assets (valid for 7 days from extraction)
```js
// Signup page
const imgVyrixLogo   = "https://www.figma.com/api/mcp/asset/be8a3ead-674f-4c1d-a6d4-78efba30a91d"; // image 5 - logo
const imgBackground  = "https://www.figma.com/api/mcp/asset/ba6ccdc3-3004-46e4-b418-dfe8583e90d8"; // image (1) 1 - bg
const imgGoogle      = "https://www.figma.com/api/mcp/asset/0f1aefd2-0516-4714-a51c-f0b91220c24b"; // google icon
const imgEyeIcon     = "https://www.figma.com/api/mcp/asset/10b065b3-7dc3-495a-bf6f-8fb86bd60d4e"; // eye toggle
const imgStep1Icon   = "https://www.figma.com/api/mcp/asset/b6e69e2f-d8b3-4164-8043-28e6784aaf0c"; // step 1 icon
const imgStep2Icon   = "https://www.figma.com/api/mcp/asset/b18a34c5-c26b-47c0-82b8-3a1769fba86b"; // step 2 icon
const imgStep3Icon   = "https://www.figma.com/api/mcp/asset/e576ede3-5af7-477d-9129-3e0f30ade59f"; // step 3 icon
const imgLine1       = "https://www.figma.com/api/mcp/asset/f751a85a-86a2-401d-aa2e-f5d93bcbc4ea"; // divider line left
const imgLine2       = "https://www.figma.com/api/mcp/asset/21cc4b31-ce79-46d9-a82f-441104a205c4"; // divider line right
```

---

## Page 2: Login Page (`/login`) — Figma node 11:43

### Layout

Single centered form — centered on the page with background image.

**Background**
- Full page dark background image (same background image as signup, rotated)
- No split columns — form is center-aligned on screen

**Content (centered at x=742–1176, width=434px)**
- Vyrix logo (`image 5`) — centered, top area (~y=193)
- Main heading: `"Log in your Account"` — `40px, Unbounded, white, center, top=346`
- Form fields:
  1. **Email** — `w-[434px], h-[60px], bg-[#1e1e1e], rounded-[11px]`, label above
  2. **Password** — same sizing, with eye toggle icon on right
- **Sign in** button — `w-[434px], h-[60px], bg-white, text-black, rounded-[11px], text-[20px]`
- `"or"` divider with lines
- **Google** button — `w-[434px], h-[60px], border border-[#6b6b6b], rounded-[11px]`, Google icon + text
- Footer: `"Dont have an Account?"` + `"Sign Up"` link in `#92a9e1`

### Assets (valid for 7 days from extraction)
```js
// Login page
const imgVyrixLogo  = "https://www.figma.com/api/mcp/asset/1e998559-a20d-4a6d-bf2c-e0ef0389c04e"; // logo
const imgBackground = "https://www.figma.com/api/mcp/asset/965986af-3cbc-41db-8543-b91078ecd98d"; // bg image
const imgGoogle     = "https://www.figma.com/api/mcp/asset/91e14327-f0bc-4687-8941-8f9263f7d2fb"; // google icon
const imgEyeIcon    = "https://www.figma.com/api/mcp/asset/ce597eeb-18dd-4073-89b1-2a886cdb5d68"; // eye toggle
const imgLine1      = "https://www.figma.com/api/mcp/asset/1f281d5a-d843-4282-b516-06a07793c0e6"; // divider line left
const imgLine2      = "https://www.figma.com/api/mcp/asset/b7081322-5d27-4984-a5fd-490dc59a348c"; // divider line right
```

---

## Reusable Components

### `InputField.jsx`
```jsx
// Props: label, placeholder, type, value, onChange, rightIcon
// Dark bg (#1e1e1e), rounded-[11px], h-[60px], label above
// rightIcon: optional element (eye toggle)
```

### `Button.jsx`
```jsx
// Props: children, variant ('primary' | 'outline'), onClick, fullWidth
// primary: bg-white text-black
// outline: border border-[#6b6b6b] text-white
// Both: h-[60px], rounded-[11px], text-[20px], font-semibold
```

### `Divider.jsx`
```jsx
// "or" text centered with horizontal lines on each side
// Color: #c7c7c7, lines from Figma assets OR CSS hr
```

### `OnboardingSidebar.jsx` ← NEW (shared across Desktop-1, 3, 4, 5)
```jsx
// Props: activeStep (1 | 2 | 3)
// Always renders:
//   - Background image with purple overlay (rounded-[54px])
//   - Vyrix logo top-left
//   - "Get Started with Us" heading (Unbounded, 40px, white)
//   - Subtext: "Complete these easy steps..."
//   - 3 step buttons at bottom
// Step button active state:  bg-white, text-black
// Step button inactive state: bg-[#1e1e1e], text-[#c7c7c7]
// Steps:
//   1 → "Sign up your account"   icon: imgStep1Icon
//   2 → "Set up your profile"    icon: imgStep2Icon
//   3 → "Know about your workspace" icon: imgStep3Icon
```

### `StepButton.jsx` ← NEW
```jsx
// Props: label, icon, isActive, onClick
// Active:   bg-white border border-[rgba(71,67,126,0.54)] text-black
// Inactive: bg-[#1e1e1e] border border-[rgba(71,67,126,0.54)] text-[#c7c7c7]
// Size: w-[389px] h-[60px] rounded-[11px]
// Icon on left (26×26px image), label text right
```

---

## Routing

```jsx
// App.jsx
<Routes>
  <Route path="/" element={<Navigate to="/signup" />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/login" element={<Login />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/tutorials" element={<Tutorials />} />
  <Route path="/tutorials/next" element={<TutorialsNext />} />
</Routes>
```

The full onboarding flow order is:
`/signup` → `/profile` → `/tutorials` → `/tutorials/next` → (app home, future)

---

## Tailwind Config

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        unbounded: ['Unbounded', 'sans-serif'],
        sf: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro', 'sans-serif'],
      },
      borderRadius: {
        '11': '11px',
        '54': '54px',
      },
      colors: {
        'vyrix-input': '#1e1e1e',
        'vyrix-label': '#e1e1e1',
        'vyrix-placeholder': '#c7c7c7',
        'vyrix-link-blue': '#b2c5f2',
        'vyrix-link-purple': '#92a9e1',
        'vyrix-border': 'rgba(71,67,126,0.54)',
      },
    },
  },
  plugins: [],
}
```

---

## index.css — Font Import

```css
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Form Behaviour

- All fields are controlled components (`useState`)
- Password field has show/hide toggle using eye icon
- No form validation needed for now (just UI)
- No API calls yet — backend connection comes later
- Google button is UI only for now (no OAuth flow)
- Navigation: "Log In" link → `/login`, "Sign Up" link → `/signup`

---

## Important Notes for Claude Code

1. **Use Figma asset URLs directly** as `<img src={...} />` — do not replace with placeholder icons
2. **DO NOT use Next.js** — plain React with Vite
3. **Tailwind must be installed** — run `npm install -D tailwindcss postcss autoprefixer` and init config
4. **Install React Router** — `npm install react-router-dom`
5. **Unbounded font** must be loaded via Google Fonts in `index.html` or `index.css`
6. The Figma design is 1920×1080 — build it responsive but keep the desktop layout as primary
7. Use **functional components** with hooks only — no class components
8. Keep components **modular** — InputField, Button, Divider as separate reusable components
9. Use **`font-['Unbounded']`** for headings and **system SF Pro fallback** for body text

---

## Figma Reference URLs

- Signup screen: `https://www.figma.com/design/mtxT4Ux2foUfsTDkMNfnel/Vyrix-UI-Design?node-id=3-2`
- Login screen: `https://www.figma.com/design/mtxT4Ux2foUfsTDkMNfnel/Vyrix-UI-Design?node-id=11-43`
- Profile screen: `https://www.figma.com/design/mtxT4Ux2foUfsTDkMNfnel/Vyrix-UI-Design?node-id=15-6`
- Tutorials (Skip): `https://www.figma.com/design/mtxT4Ux2foUfsTDkMNfnel/Vyrix-UI-Design?node-id=15-73`
- Tutorials (Next): `https://www.figma.com/design/mtxT4Ux2foUfsTDkMNfnel/Vyrix-UI-Design?node-id=15-120`

---

## Page 3: Profile Setup (`/profile`) — Figma node 15:6

### Layout

Same split-screen as Signup. Left column is identical (`OnboardingSidebar` with `activeStep={2}`).

**Left Column** — reuse `<OnboardingSidebar activeStep={2} />`
- Step 2 ("Set up your profile") is now **active** (white bg)
- Step 1 ("Sign up your account") is also white/active (already completed)
- Step 3 ("Know about your workspace") is inactive (dark)

**Right Column**
- Subheading: `"Create your personal profile"` — `20px, #e1e1e1, center`
- Main heading: `"Setting up your Profile"` — `40px, Unbounded, white, center`
- Avatar area (center-right):
  - Circular avatar image `105×105px` — use `imgUser1` (default avatar)
  - Small `"Edit"` button overlay — `bg-[#1e1e1e], rounded-[11px], w-[57px], h-[25px], text-[12px], text-[#c7c7c7]`
- Form fields:
  1. **Username** (`"Create your username"`) — `w-[434px], h-[60px], bg-[#1e1e1e], rounded-[11px]`, placeholder: `"eg. John3399"`
  2. **Profession** (`"Enter your Profession"`) — same sizing, placeholder: `"Student / Teacher / Employee, etc"`
- **Verify your Email** button — `w-[434px], h-[60px], bg-white, text-black, rounded-[11px], text-[20px]`
- OTP field below button:
  - `w-[206px], h-[60px], bg-[#1e1e1e], rounded-[11px]`, centered, placeholder: `"Enter OTP"`
- `"Continue"` link — `text-[#92a9e1], text-[14px], bold, center` — navigates to `/tutorials`

### Assets
```js
const imgVyrixLogo  = "https://www.figma.com/api/mcp/asset/3910a5a0-2141-4e72-9a42-88b478317992";
const imgBackground = "https://www.figma.com/api/mcp/asset/daf11f2a-d37c-4970-8cf5-e3a4a3dfb47c";
const imgUser1      = "https://www.figma.com/api/mcp/asset/1fc9cb80-98d6-4b5f-89fe-9ea479c674ba"; // default avatar
const imgStep1Icon  = "https://www.figma.com/api/mcp/asset/1281319f-0588-40f8-8c75-c23da0a20b0a";
const imgStep2Icon  = "https://www.figma.com/api/mcp/asset/1abc86df-60d1-4bd3-a436-6e637731e14f";
const imgStep3Icon  = "https://www.figma.com/api/mcp/asset/1f2b7099-04bf-426f-b226-7c8b5b39e0ed";
```

---

## Page 4: Tutorials — Skip state (`/tutorials`) — Figma node 15:73

### Layout

Same split-screen. Left column: `<OnboardingSidebar activeStep={3} />` — all 3 steps now active/white.

**Right Column**
- Top-right `"Skip"` link — `text-[#a3a3a3], text-[20px]`, positioned top-right, navigates to app home (future)
- Main heading: `"Tutorials"` — `40px, Unbounded, white, top-left of right panel`
- Body text (large paragraph): `16px, white, w-[612px]`
  ```
  Research is hard. Synthesis is harder. You collect data from papers, interviews,
  spreadsheets, and articles but they live in different tools, scattered across your
  computer and your mind. When it comes to time to write, you're staring at a blank
  page, dozens of notes, and a nagging feeling that you're missing the logical thread.

  Vyrix solves this by bringing all your sources into one unified space, guiding you
  through synthesis with structured steps, and providing AI mentorship that validates
  your thinking in real time. Let's go from scattered overwhelm to confident,
  evidence backed writing.
  ```
- Large dark content area below text: `w-[612px], h-[589px], bg-[#1e1e1e], rounded-[11px]`
  - This is a video/media placeholder — render as empty dark box for now

### Assets
```js
const imgVyrixLogo  = "https://www.figma.com/api/mcp/asset/878e1563-9415-4506-a38f-e226ab84cd2e";
const imgBackground = "https://www.figma.com/api/mcp/asset/b925d1a0-1420-42c5-ae0a-ba964c491f97";
const imgStep1Icon  = "https://www.figma.com/api/mcp/asset/c3b5af69-1d0f-4d6a-97d4-2e675c8af0be";
const imgStep2Icon  = "https://www.figma.com/api/mcp/asset/125887c9-856f-47f7-aacc-d52e8da0b496";
const imgStep3Icon  = "https://www.figma.com/api/mcp/asset/5588d9b0-dc09-4c53-a703-f5151b104905";
```

---

## Page 5: Tutorials — Next state (`/tutorials/next`) — Figma node 15:120

### Layout

**Identical to Page 4** with two differences:

1. `"Skip"` link is replaced by `"Next"` link — `text-[#92a9e1]` (purple-blue), navigates forward
2. The large content area changes from `bg-[#1e1e1e]` (clickable link state) to `bg-[#1e1e1e]` (standard dark box, same visual but not a link)

Everything else — heading, body text, sidebar, assets — is the same as Page 4.

Tip: Build `Tutorials.jsx` to accept a prop `isNextState` (bool) and render accordingly, or just build two separate thin page components that share a `TutorialsLayout` component.

### Assets
```js
const imgVyrixLogo  = "https://www.figma.com/api/mcp/asset/80b5bcf3-ac54-4fe4-8489-b4a6fc1905c5";
const imgBackground = "https://www.figma.com/api/mcp/asset/79895736-5324-48f3-9cc7-4be45f9f3229";
const imgStep1Icon  = "https://www.figma.com/api/mcp/asset/b56bc8ff-3e21-4ed3-a1dc-f8b6d2799d36";
const imgStep2Icon  = "https://www.figma.com/api/mcp/asset/35e54576-094b-425b-bea0-5b1810d4ee1a";
const imgStep3Icon  = "https://www.figma.com/api/mcp/asset/aa71e9ec-2890-46da-ba83-b9b4d6b1822a";
```

---

## Claude Code Prompt for New Pages

```
The SPEC.md file has been updated with 3 new pages: Profile, Tutorials (skip), Tutorials (next).

All pages share the same split-screen layout as Signup. Build in this order:

1. Create src/components/onboarding/StepButton.jsx
2. Create src/components/onboarding/OnboardingSidebar.jsx — accepts activeStep prop (1|2|3)
   - Reuse this in Signup.jsx, Profile.jsx, Tutorials.jsx, TutorialsNext.jsx
   - Replace the duplicated left-panel code in Signup.jsx with <OnboardingSidebar activeStep={1} />
3. Create src/pages/Profile.jsx (activeStep=2) — username, profession, avatar upload, email verify + OTP
4. Create src/pages/Tutorials.jsx (activeStep=3) — heading, body text, skip link, dark media box
5. Create src/pages/TutorialsNext.jsx (activeStep=3) — same as Tutorials but "Next" link in #92a9e1
6. Update src/App.jsx with the new routes

Use the Figma asset URLs from SPEC.md exactly as-is. Do not substitute any icons or images.
Confirm each file before moving to the next.
```


---

---

# Phase 4: Home Page (`/home`) — Figma node 61:3

## Figma Reference
- Main Home: `https://www.figma.com/design/mtxT4Ux2foUfsTDkMNfnel/Vyrix-UI-Design?node-id=61-3`
- With To-Do panel open: `https://www.figma.com/design/mtxT4Ux2foUfsTDkMNfnel/Vyrix-UI-Design?node-id=71-2928`
- Screenshot (main): `https://www.figma.com/api/mcp/asset/29b6e1bc-289e-4059-9afd-fcb08ba9f89d`
- Screenshot (with To-Do): `https://www.figma.com/api/mcp/asset/12282ffe-3322-4bd3-9d2a-f9c1c5d4ee6a`

## Overview

The Home page is the **main app dashboard** shown after completing onboarding. It uses a completely different layout from the onboarding pages — no split-screen, it is a full-width dark app shell with:

- A **left sidebar** (fixed, `w-[320px]`, full height) — navigation + workspace + beta card
- A **top navbar** (horizontal, above the content area) — logo, document tabs, "My To Do" button
- A **main content area** (everything right of the sidebar) — gradient header with greeting + recent docs + "Create new project" bar + Your Projects (folders)

---

## Layout Breakdown (1920×1080)

### Background
- Outer wrapper: `bg-black w-full h-screen`
- Inner card: `bg-black rounded-[22px]` at `x=29, y=27, w=1862, h=1027` (slight inset from screen edges)
- Full overlay: `bg-[rgba(0,0,0,0.2)]` on top

### Left Sidebar — `x=0, w=320, h=1080`
Fixed left panel, separated from content by a vertical divider line at `x=320`.

**Top — Logo + Username (y=28–108)**
- Hamburger icon (3 lines): `x=40, y=34/42/50` — `w=21, h=0` lines, `text-white` — just 3 `<hr>`-style lines
- Vyrix logo (`image 5`): `x=90, y=32, w=100, h=18`
- User avatar (`user 1`): `x=25, y=79, w=45, h=45`, circular
- Username text: `x=90, y=93` — **DYNAMIC: `user.firstName`** from auth context, `font-SF, font-[590], 16px, white`
- Dropdown chevron vector: `x=159, y=102` — small `10×4px` arrow

**Workspace section (y=144–366)**
- Section label: `"Workspace"` — `13px, #d5d5d5, bold, tracking-[0.13px]`
- Nav items (each `h=35, w=277, rounded-[11px], px-12, py-9`):
  1. **Home** — active state: `bg-[#b2c5f2] text-black font-bold` (this is the current page)
  2. **All Files** — inactive: `text-[#c7c7c7] font-regular`
  3. **Starred** — inactive
  4. **AI** — inactive
  5. **Community** — inactive
- Each nav item has a small icon (SVG vector) on the left, `17×17px`

**Teamspace section (y=398–589) — "Arriving soon" overlay**
- Section label: `"Teamspace"` — same style as Workspace
- 4 blurred nav items underneath (same pattern as Workspace): Projects, Starred, To do (with `BETA` badge), Recent Activity
- The entire Teamspace section is `opacity-[0.42] blur-[1.5px]` — it's grayed out/coming soon
- Centered overlay badge: `bg-[rgba(20,24,46,0.55)] border border-[rgba(178,197,242,0.32)] rounded-[11px] px-4 py-2 shadow-lg` with a small icon + `"Arriving soon"` in `#b2c5f2, 12px, bold`

**Divider lines (sidebar)**
- Horizontal line at `y=396` (above Teamspace): `x=20, w=285`
- Horizontal line at `y=615` (below Teamspace): `x=20, w=285`

**Bottom Beta Card (y=851–1061)**
- Container: `x=21, y=851, w=284, h=210, bg-[rgba(71,67,126,0.54)], rounded-[18px]`
- Overlaid border card: `border border-[rgba(178,197,242,0.12)] rounded-[18px] p-[19px]` with gradient glow top-right
- Text: `"V - Beta 1.0"` — `Unbounded, 15px, white, font-medium`
- Subtext: `"Unleash your Research Potential"` — `12px, #cfcfdc, line-height 18px`
- Scroll indicator (right edge): thin `w=5px, h=562px, bg-[rgba(178,197,242,0.5)] rounded-[21px]` at far right

---

### Top Navbar — `y=20–58, x=320–1920`

Sits above the content area, separated from content by horizontal line at `y=58` (`x=441, w=1477`).

- **Document tabs** (browser-tab style, `x=320–857`):
  - Active tab: `bg-[#b2c5f2] text-black font-bold rounded-tl-[9px] rounded-tr-[9px] h-[36px] px-[19px]` with `×` close button — **DYNAMIC: title of currently open document** (hardcode `"Untitled 1"` for now)
  - Inactive tabs: `bg-[rgba(118,114,149,0.14)] text-[#8d8d97] font-regular rounded-tl-[9px] rounded-tr-[9px] h-[36px] px-[19px]` with `×` — hardcode 3 inactive tabs: "Red Sun new", "Untitled New", "Red Sun 4"
  - `+` new tab button: `x=857, w=34, h=34, text-[#8d8d97], rounded-[9px], text-center, text-[18px]`
- **"My To Do" button** (top-right, `x=1696, y=108, w=158, h=50`):
  - `bg-[#b2c5f2] rounded-[20px] border border-[#8c8c8c]`
  - Icon (checklist SVG) + `"My To Do"` text: `16px, text-black font-[510]`
  - Clicking this toggles the To-Do panel (see To-Do Panel section below)

---

### Main Content Area — `x=339–1879, y=35–1080`

**Gradient Header Area (y=35–800)**
- Background: `GRADIENT 1` — layered CSS gradients/vectors creating a dark blue-purple gradient, sitting on top of `rounded-[15px]` rectangle with overlay blend mode.
  - Simplify as: `bg-gradient-to-b from-[rgba(71,67,126,0.3)] via-transparent to-transparent rounded-[15px]`

**Greeting (y=93)**
- `"Hi {user.firstName}!"` + `"What are you up to?"` — two lines
- `font-Unbounded, 40px, font-medium, text-[#e7e7e7]`
- **DYNAMIC: replace `"Ishaan"` with `user.firstName` from auth context**

**Recent Activity label (y=215)**
- `"Recent Activity"` — `20px, #d5d5d5, font-[590], SF Pro`

**Recent Activity Document Cards (y=270–525) — 4 cards in a row**
- Each card: `w=339px, h=191px, rounded-[20px]`
- Card inner image: `rounded-[20px], w=288, h=169` (thumbnail placeholder — render as `bg-[#1e1e1e]` dark box)
- Below each card:
  - Document title: `16px, white, font-[510]` — **DYNAMIC: doc title** (hardcode for now: "Untitled 1", "Red Sun new", "Untitled 2", "SPD-1")
  - Time edited: `12px, #d5d5d5, font-normal` — **DYNAMIC: last edited time** (hardcode: "Edited 12m ago", "Edited 40m ago", "Edited 2hrs ago", "Edited 1d ago")
- Each card has hover actions (icon buttons `30×30px, backdrop-blur, bg-[rgba(10,12,26,0.55)], border rounded-[9px]`): 2 buttons — one star/bookmark icon, one more/options icon

**"Create new project" Bar (y=548–628)**
- Full-width bar: `x=375, w=1476, h=80, bg-[#b2c5f2], rounded-[20px]`
- Center: `+` icon (`22×22px`) + `"Create new project"` text: `20px, text-black, font-bold`
- This is a **clickable button** — for now it does nothing (future: create project modal)

**"Your Projects" Section (y=646–812)**
- Label: `"Your Projects"` — `20px, #d5d5d5, font-[590]`
- Project folder icons in a row (each `w=108px`):
  - Each folder: folder icon image (`ae0673b8` asset) `78×64px` + folder name below (`15px, white, bold`) + item count (`11px, #8d8d97`)
  - Hardcode 3 folders: "August" (8 items), "Internship" (5 items), "College" (12 items)
  - **Note: No real folders exist yet** — hardcode these as static placeholders
  - `+ New folder` button: dashed/outlined box `108×64px` with `+` icon + `"New folder"` label `14.9px, #cfcfdc`

**Recent Files Row (y=851–1047) — 5 document thumbnail cards**
- Smaller thumbnail cards: `w≈266px, h≈166px, rounded-[20px]`
- Each has 2 hover action buttons (same style as Recent Activity cards)
- Below each: document title `16px, #d5d5d5, font-[510]`
- Hardcode titles: "Untitled 1", "Red Sun new", "Untitled 1", "Red Sun new", "Red Sun new"
- **These are the same recent documents** shown at top — just a second row view

---

## To-Do Panel (Toggle State — node 71:2928)

When user clicks **"My To Do"** button, a panel slides in from the right (or overlays the content):
- Panel: `x=1439, y=93, w=415, h=543, bg-[#1a1a2e] rounded-[18px]` (dark blueish background based on design)
- `"My To-Do"` heading: `Unbounded, 28px (approx), white`
- Progress indicator: circle `41×41px` with radial progress + `"3 of 7"` text + `"done already - Keep Going {firstName}"` — **DYNAMIC: replace with `user.firstName`**
- Horizontal divider line
- `"Add new task"` input row: `w=362, h=35, bg rounded-[11px], border` with `+` vector icon
- **"Ongoing"** section label + checklist items (unchecked boxes `17×17px`):
  - `"Survey for SPD 1"`
  - `"Send Untitled 2 for Draft"`
  - `"Make a Whiteboard for Red Sun"`
  - `"Complete Internship Project"`
- **"Completed"** section label + checked items (same list structure but checked)
- **Hardcode all todo items for now** — no backend integration yet

---

## Assets (from Figma — valid 7 days)

```js
// Home Page assets
const imgUser1     = "https://www.figma.com/api/mcp/asset/90dd7b4b-58c0-48ad-910e-b606fd5b5a68"; // default avatar
const imgImage5    = "https://www.figma.com/api/mcp/asset/fc4394c0-b5b0-4cc3-ad18-265a683f89c4"; // Vyrix logo (small)
const imgGroup34   = "https://www.figma.com/api/mcp/asset/bf7ddc28-ab81-4703-bb3a-c96f8b81486c"; // checklist icon (To Do button)

// Recent doc thumbnails (card images)
const imgDocThumb1 = "https://www.figma.com/api/mcp/asset/3b12d63b-0e00-40cd-9207-1c042fafc6d2"; // Rectangle 16
const imgDocThumb2 = "https://www.figma.com/api/mcp/asset/68dc8315-c51d-4bad-815b-4264b01c79d7"; // Rectangle 17
const imgDocThumb3 = "https://www.figma.com/api/mcp/asset/e144ce95-a44a-4603-9e0b-3eae4f726dc3"; // Rectangle 18
const imgDocThumb4 = "https://www.figma.com/api/mcp/asset/9e2fee35-7b40-439f-b341-8ef4e074047b"; // Rectangle 20

// Bottom row thumbnails
const imgDocThumb5 = "https://www.figma.com/api/mcp/asset/2fc254fc-c973-4f5f-a501-5b8627dc6b8c"; // Rectangle 22
const imgDocThumb6 = "https://www.figma.com/api/mcp/asset/6101a297-80d3-44fc-9981-b3aebed6a056"; // Rectangle 24
const imgDocThumb7 = "https://www.figma.com/api/mcp/asset/2ca54e30-1f04-40e1-b035-0c7fee267c7d"; // Rectangle 25
const imgDocThumb8 = "https://www.figma.com/api/mcp/asset/0bc0a497-624c-4e79-9cdf-0341c108e8c1"; // Rectangle 27
const imgDocThumb9 = "https://www.figma.com/api/mcp/asset/5c1bb162-a8bc-41d3-8988-a01bd7712e3b"; // Rectangle 29

// Folder icon (used for all project folders)
const imgFolderIcon = "https://www.figma.com/api/mcp/asset/1215f116-0efb-4807-afb6-a33d26da873c"; // ae0673b8 folder
```

---

## Dynamic Data Rules

| Element | Design shows | What to render |
|---------|-------------|----------------|
| `"Hi Ishaan!"` | Hardcoded name | `user.firstName` from auth context / API response |
| `"done already - Keep Going Ishaan"` | Hardcoded name | `user.firstName` |
| Username in sidebar | `"Ishaan"` | `user.firstName` |
| User avatar | Default avatar | `user.profilePic` if exists, else `imgUser1` |
| Recent Activity titles | Hardcoded doc names | Hardcode for now (no API) |
| Recent Activity timestamps | Hardcoded times | Hardcode for now |
| Project folders | Hardcoded 3 folders | Hardcode for now (no folder API yet) |
| To-Do items | Hardcoded tasks | Hardcode for now |

**How to get `user.firstName`:** Call `GET /api/auth/me` (or equivalent) on mount and store in a `useContext`/`useState`. The backend returns the logged-in user's data from the JWT cookie.

---

## Component Structure for Home Page

```
src/
├── pages/
│   └── Home.jsx              ← main home page, composes all sections
├── components/
│   └── home/
│       ├── Sidebar.jsx       ← left sidebar (logo, nav, teamspace, beta card)
│       ├── Navbar.jsx        ← top tab bar + "My To Do" button
│       ├── GreetingHeader.jsx← gradient area + greeting + recent activity cards
│       ├── DocumentCard.jsx  ← reusable single doc thumbnail card (used in both rows)
│       ├── ProjectsSection.jsx← "Your Projects" folders row
│       ├── CreateProjectBar.jsx← blue "Create new project" CTA bar
│       └── TodoPanel.jsx     ← sliding To-Do panel (toggled by "My To Do" button)
```

---

## Build Plan — Level by Level (DO THIS IN ORDER, CHECK BEFORE NEXT)

### Level 1 — Sidebar skeleton
Build `Sidebar.jsx` with:
- Logo + hamburger lines + user avatar + `user.firstName`
- Workspace nav items (Home active, rest inactive) with correct colors
- Teamspace section (blurred + "Arriving soon" badge)
- Horizontal divider lines
- Beta card at bottom
- Vertical divider line on right edge

**Check:** Sidebar renders correctly, username shows from prop, active item is highlighted.

---

### Level 2 — Top Navbar
Build `Navbar.jsx` with:
- 4 document tabs (1 active `bg-[#b2c5f2]`, 3 inactive) with `×` close buttons
- `+` new tab button
- `"My To Do"` toggle button (right side, blue pill)
- Horizontal separator line

**Check:** Tabs render, active tab is blue, "My To Do" button is visible.

---

### Level 3 — Greeting + Recent Activity Cards
Build `GreetingHeader.jsx` with:
- Gradient background (CSS gradient, no image needed)
- `"Hi {firstName}! What are you up to?"` heading (Unbounded, 40px)
- `"Recent Activity"` label
- 4 `DocumentCard` components in a row:
  - Each card: rounded dark container + thumbnail image + title + timestamp
  - Hover: show 2 icon buttons (star, more)

**Check:** Greeting shows correct name, 4 cards render with correct spacing.

---

### Level 4 — Create Project Bar + Your Projects
Build `CreateProjectBar.jsx` and `ProjectsSection.jsx`:
- Blue `"Create new project"` bar (full width of content area, `h=80, rounded-[20px]`)
- Folder icons row: 3 hardcoded folders + "New folder" add button
- Each folder: icon image + name label + item count

**Check:** Bar is correctly blue/sized, 3 folders + new folder button visible.

---

### Level 5 — Bottom Recent Files Row
Add a second row of 5 smaller `DocumentCard` components below the projects section.
- Same card style but slightly smaller (`w≈266px, h≈166px`)
- Each has 2 hover action buttons

**Check:** Row of 5 cards renders, thumbnail images load.

---

### Level 6 — To-Do Panel
Build `TodoPanel.jsx`:
- Render conditionally based on `isTodoOpen` state in `Home.jsx`
- Panel: positioned at right side of content area, `w=415, h=543`
- Progress circle + counter text + `"Keep Going {firstName}"`
- `"Add new task"` input
- Ongoing tasks list (4 items, unchecked)
- Completed tasks list (same 4 items but with checked icon)
- Hardcode all items — no API yet

**Check:** Panel toggles open/closed when "My To Do" button clicked.

---

### Level 7 — Wire up user data
- In `Home.jsx`, on mount: `GET /api/auth/me` → store `{ firstName, profilePic, ... }` in state
- Pass `firstName` down to `Sidebar`, `GreetingHeader`, `TodoPanel`
- Use `user.profilePic` as avatar src (fallback to `imgUser1` default)
- If no auth (401 response), redirect to `/login`

**Check:** `"Hi {actualName}!"` shows real logged-in user name.

---

## New Route

```jsx
// App.jsx — add this route
<Route path="/home" element={<Home />} />

// After login (Login.jsx), navigate to:
navigate('/home')

// After tutorials/next (TutorialsNext.jsx), navigate to:
navigate('/home')
```

---

## Design Tokens (Home-specific)

```js
// New colors introduced in Home page
bg-[#b2c5f2]              → Active nav item, tab, CTA bar (#b2c5f2 Perano blue)
bg-[rgba(71,67,126,0.54)] → Sidebar beta card bg (purple tint)
bg-[rgba(118,114,149,0.14)] → Inactive tab bg
bg-[rgba(20,24,46,0.55)]  → "Arriving soon" badge bg
bg-[rgba(10,12,26,0.55)]  → Card hover button bg (dark with blur)
text-[#d5d5d5]            → Section labels, card titles, secondary text
text-[#c7c7c7]            → Inactive nav items
text-[#8d8d97]            → Inactive tab text, item counts (Manatee)
text-[#cfcfdc]            → Beta card subtext (Mischka)

// New sizing
rounded-[20px]            → Cards, beta card, CTA bar
rounded-[22px]            → Main content card
rounded-[18px]            → Sidebar beta card
rounded-[11px]            → Nav items
rounded-tl-[9px] rounded-tr-[9px] → Document tabs (top corners only)
rounded-[9px]             → Card hover buttons
```

---

## Notes for Claude Code

1. **`"Ishaan"` everywhere = `user.firstName`** — never hardcode a name, always read from user state
2. **To-Do items are all hardcoded** — no backend API for this yet, just static JSX
3. **Project folders are all hardcoded** — "August", "Internship", "College" are placeholders
4. **Recent Activity documents are hardcoded** — "Untitled 1", "Red Sun new", etc. are placeholders
5. **Teamspace section is intentionally blurred** — `opacity-[0.42] blur-[1.5px]` + overlay badge
6. **Card hover buttons** — only show on `hover:` (use Tailwind `group` + `group-hover:opacity-100`)
7. **Do NOT use Next.js** — plain React + Vite as always
8. **Build level by level** — complete and verify each level before proceeding to the next
9. **The gradient header** — use pure CSS `bg-gradient-to-b from-[rgba(71,67,126,0.25)] to-transparent` on the content area, no image needed
10. **TipTap notepad** — NOT in this phase. The document cards are thumbnails only. TipTap editor comes in a later phase when clicking a doc opens it.
11. **"New folder" behavior** — clicking it does nothing for now (alert or no-op)
12. **"Create new project"** — clicking it does nothing for now (alert or no-op)

---

## Claude Code Prompt for Home Page

```
Read SPEC.md — Phase 4 section carefully before starting.

Build the Home page (`/home`) for Vyrix. Work level by level as described. 
After each level, stop and report what was built before proceeding.

Key rules:
- ALL names ("Ishaan") must be replaced with `user.firstName` from API
- Start with Level 1: Sidebar.jsx
- Use Figma asset URLs from the spec as-is for all images
- Keep existing pages and routing intact — only add new files
- User data comes from GET /api/auth/me on mount (cookie auth)
- If 401, redirect to /login

Tech: React 18 + Vite + Tailwind CSS + React Router v6
New components go in: src/components/home/
Main page: src/pages/Home.jsx
```

---

---

# Phase 5: Document Editor — TipTap + Live Home Data

## Overview

This phase makes everything on the Home page real and builds the full document editor. By the end of this phase:

- Clicking **"Create new project"** creates a real document in the DB and opens the editor
- The **Recent Activity** and **Recent Files** rows show the user's actual documents
- The **Projects/folders** section shows empty state cleanly when no docs exist
- Clicking any document card opens the **editor page** (`/doc/:id`)
- The editor is a **TipTap rich text editor** — clean, minimal, investor-ready
- Documents **auto-save** as the user types (debounced 1.5s)
- Everything feels like Notion/Linear quality — dark, smooth, polished

---

## Design Direction (no Figma — we define it here)

Consistent with the existing design system:

| Token | Value |
|-------|-------|
| Background | `#000000` (same as Home) |
| Editor surface | `#0d0d0d` — slightly lifted from pure black |
| Toolbar bg | `rgba(255,255,255,0.04)` — very subtle separation |
| Toolbar button | `rgba(178,197,242,0.08)` hover `rgba(178,197,242,0.15)` |
| Active toolbar button | `bg-[#b2c5f2] text-black` |
| Editor text | `#e7e7e7` body, `white` for H1/H2 |
| Placeholder text | `#4a4a5a` |
| Title font | Unbounded, editable, large |
| Body font | SF Pro / system, 16px, line-height 1.7 |
| Accent | `#b2c5f2` (same Perano blue throughout) |
| Border/divider | `rgba(255,255,255,0.08)` |
| Save indicator | `#8d8d97` — "Saving..." / "Saved" subtle text top-right |

---

## Backend — Phase 5 Changes

### 1. New Document Model
**New file:** `src/models/document.model.js`

```js
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title:   { type: String, default: "Untitled" },
  content: { type: Object, default: {} }, // TipTap JSON output
  owner:   { type: mongoose.Schema.Types.ObjectId, ref: "user-data", required: true },
}, {
  versionKey: false,
  timestamps: true, // createdAt + updatedAt (used as lastEdited)
});

module.exports = mongoose.model("document", documentSchema);
```

### 2. Document Controller
**New file:** `src/controllers/document.controller.js`

```js
// createDocument  → POST /api/docs
//   - Creates doc with owner = req.user.id, title = "Untitled", content = {}
//   - Returns { doc: { _id, title, content, updatedAt } }

// getMyDocuments  → GET /api/docs
//   - Returns all docs where owner = req.user.id
//   - Sorted by updatedAt desc
//   - Returns { docs: [{ _id, title, updatedAt }] } (no content — for listing only)

// getDocument     → GET /api/docs/:id
//   - Returns full doc (title + content) — only if owner matches req.user.id
//   - 403 if not owner, 404 if not found

// updateDocument  → PATCH /api/docs/:id
//   - Accepts { title?, content? } — updates only what's provided
//   - Only if owner matches req.user.id
//   - Returns { doc: { _id, title, updatedAt } }

// deleteDocument  → DELETE /api/docs/:id
//   - Deletes doc only if owner matches
//   - Returns { message: "Deleted" }
```

### 3. Document Routes
**New file:** `src/routes/document.routes.js`

```js
const router = require("express").Router();
const { authUser } = require("../middlewares/auth.middleware");
const docController = require("../controllers/document.controller");

router.use(authUser); // all doc routes require auth

router.post("/",        docController.createDocument);
router.get("/",         docController.getMyDocuments);
router.get("/:id",      docController.getDocument);
router.patch("/:id",    docController.updateDocument);
router.delete("/:id",   docController.deleteDocument);

module.exports = router;
```

### 4. Register in app.js
```js
const documentRoutes = require("./routes/document.routes");
app.use("/api/docs", documentRoutes);
```

### 5. API Summary

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | `/api/docs` | — | `{ doc: { _id, title, updatedAt } }` |
| GET | `/api/docs` | — | `{ docs: [{ _id, title, updatedAt }] }` |
| GET | `/api/docs/:id` | — | `{ doc: { _id, title, content, updatedAt } }` |
| PATCH | `/api/docs/:id` | `{ title?, content? }` | `{ doc: { _id, title, updatedAt } }` |
| DELETE | `/api/docs/:id` | — | `{ message }` |

---

## Frontend — Phase 5 Changes

### New files
```
src/
├── pages/
│   └── Editor.jsx                    ← /doc/:id — full editor page
├── components/
│   └── editor/
│       ├── EditorToolbar.jsx         ← formatting toolbar
│       ├── TipTapEditor.jsx          ← TipTap instance + config
│       └── SaveIndicator.jsx         ← "Saving..." / "Saved ✓" status
```

### Modified files
```
src/pages/Home.jsx         ← wire real docs, empty state, card click → /doc/:id
src/App.jsx                ← add /doc/:id route
```

### Packages to install (frontend)
```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-typography @tiptap/extension-character-count
```

---

## Home Page — Live Data

Replace all hardcoded doc data with real API calls.

### `Home.jsx` data fetching:
```js
// On mount, alongside /api/auth/me, also call:
GET /api/docs
// → store in: const [docs, setDocs] = useState([])
```

### Recent Activity section (GreetingHeader):
- Pass `docs` array to `GreetingHeader`
- Show up to 4 most recent docs as cards
- Each card: title from `doc.title`, timestamp from `doc.updatedAt` formatted as relative time ("Edited 2m ago")
- **No more thumbnail images** — replace with a clean dark card with the document title styled large inside, like Notion's card view:
  - Card bg: `bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-[20px]`
  - Inside: document title in `text-white font-medium text-[18px]` centered or top-left
  - A subtle gradient overlay at bottom

### Empty state:
- If `docs.length === 0`, instead of cards show:
  ```
  <div className="flex flex-col items-center justify-center h-[191px] w-full rounded-[20px] border border-dashed border-[rgba(178,197,242,0.2)] text-[#4a4a5a] text-[14px]">
    No documents yet — create your first one above
  </div>
  ```

### "Create new project" bar:
```js
// onClick:
const createDoc = async () => {
  const { data } = await api.post("/api/docs");
  navigate(`/doc/${data.doc._id}`);
}
```

### Document card click:
```js
// Each DocumentCard gets an onClick:
onClick={() => navigate(`/doc/${doc._id}`)}
```

### Recent Files row:
- Same as Recent Activity — use real `docs` data, `size="small"`
- Show up to 5 most recent

### Projects section:
- Keep as-is (hardcoded folders) for now with a `"Coming soon"` feel — no changes this phase

---

## Editor Page — `/doc/:id`

### Layout
Reuses the same `<Sidebar>` and `<Navbar>` shell from Home. The `<Navbar>` shows the current doc title as the active tab.

```
┌─────────────────────────────────────────────────┐
│  Sidebar (320px)  │  Navbar (tabs + My To Do)   │
│                   ├─────────────────────────────┤
│                   │  ← Back   [Title]  [Saved ✓]│
│                   ├─────────────────────────────┤
│                   │  [B] [I] [H1] [H2] [•] [1.] │  ← Toolbar
│                   ├─────────────────────────────┤
│                   │                             │
│                   │   # Document Title          │
│                   │                             │
│                   │   Start writing...          │
│                   │                             │
└─────────────────────────────────────────────────┘
```

### `Editor.jsx` — page component
```jsx
// Route: /doc/:id
// 1. On mount: GET /api/docs/:id → load title + content
// 2. If 404/403 → navigate('/home')
// 3. Render: Sidebar + Navbar + editor area
// 4. Pass content to TipTapEditor, pass title to editable title field
// 5. On content change: debounce 1.5s → PATCH /api/docs/:id { content }
// 6. On title change (blur or Enter): PATCH /api/docs/:id { title }
// 7. Show SaveIndicator state: idle | saving | saved
```

### `TipTapEditor.jsx` — the editor
```jsx
// Extensions:
// - StarterKit (bold, italic, headings H1–H3, bullet list, ordered list,
//               blockquote, code, codeBlock, hardBreak, horizontalRule)
// - Placeholder: "Start writing your research..."
// - Typography (smart quotes, dashes)
// - CharacterCount (show at bottom: "X words")

// Props: { content, onChange }
// content: TipTap JSON object from DB
// onChange: called with updated JSON on every editor change

// Styling (injected via global CSS or ProseMirror overrides):
// .ProseMirror { outline: none; font-size: 16px; line-height: 1.7; color: #e7e7e7 }
// .ProseMirror h1 { font-family: Unbounded; font-size: 32px; color: white; margin: 24px 0 12px }
// .ProseMirror h2 { font-family: Unbounded; font-size: 24px; color: white; margin: 20px 0 10px }
// .ProseMirror h3 { font-size: 18px; color: #e7e7e7; font-weight: 600; margin: 16px 0 8px }
// .ProseMirror p { margin: 0 0 12px }
// .ProseMirror ul, ol { padding-left: 24px; margin: 8px 0 }
// .ProseMirror blockquote { border-left: 3px solid #b2c5f2; padding-left: 16px; color: #8d8d97 }
// .ProseMirror code { background: rgba(178,197,242,0.1); border-radius: 4px; padding: 2px 6px; font-size: 14px }
// .ProseMirror pre { background: #111118; border-radius: 11px; padding: 16px; margin: 12px 0 }
// .ProseMirror-placeholder { color: #4a4a5a }
// .ProseMirror hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0 }
```

### `EditorToolbar.jsx` — formatting buttons
```jsx
// Props: { editor } — TipTap editor instance

// Buttons (left to right):
// [B]  Bold         → editor.chain().focus().toggleBold().run()
// [I]  Italic       → toggleItalic
// [H1] Heading 1    → toggleHeading({ level: 1 })
// [H2] Heading 2    → toggleHeading({ level: 2 })
// [•]  Bullet list  → toggleBulletList
// [1.] Ordered list → toggleOrderedList
// ["]  Blockquote   → toggleBlockquote
// [<>] Code block   → toggleCodeBlock
// [—]  Divider      → setHorizontalRule

// Each button:
// Base:   w-[34px] h-[34px] rounded-[9px] text-[#8d8d97] text-[13px] font-bold
//         flex items-center justify-center cursor-pointer
//         bg-[rgba(178,197,242,0.05)] hover:bg-[rgba(178,197,242,0.12)] transition-colors
// Active: bg-[#b2c5f2] text-black (when editor.isActive('bold') etc.)

// Toolbar container:
// w-full px-[39px] py-[10px] flex gap-[6px] items-center
// border-b border-[rgba(255,255,255,0.06)]
// bg-[rgba(255,255,255,0.02)]
// sticky top-0 z-10
```

### `SaveIndicator.jsx`
```jsx
// Props: { status } — 'idle' | 'saving' | 'saved'
// idle:   render nothing
// saving: "Saving..." — text-[12px] text-[#8d8d97]
// saved:  "Saved ✓"  — text-[12px] text-[#8d8d97], fades out after 2s
```

### Editable Title
- NOT inside TipTap — it's a plain `<input>` or `<textarea>` above the editor
- Style: `font-['Unbounded'] font-medium text-[32px] text-white bg-transparent border-none outline-none w-full placeholder-[#4a4a5a] mb-6`
- Placeholder: `"Untitled"`
- On `blur` or `Enter`: save title via `PATCH /api/docs/:id { title }`
- Max length: 100 chars

### Back navigation
- Top-left of editor area (above title): `← Back to Home` — `text-[#8d8d97] text-[13px] cursor-pointer hover:text-white` — calls `navigate('/home')`

### Word count
- Bottom-right of editor, fixed: `text-[12px] text-[#4a4a5a]` — `"X words"`

---

## Build Plan — Level by Level

### Level 1 — Backend: Document model + controller + routes
Build the full document API. Test with a REST client before touching frontend.

**Check:** `POST /api/docs` creates a doc, `GET /api/docs` returns it, `PATCH` updates it.

### Level 2 — Home page: wire real docs
- Fetch `GET /api/docs` on mount alongside `/api/auth/me`
- Replace hardcoded cards with real docs (no thumbnail — use title card style)
- Add empty state when no docs
- Wire `CreateProjectBar` to `POST /api/docs` → navigate to `/doc/:id`
- Wire `DocumentCard` `onClick` → `navigate(/doc/${id})`

**Check:** Create a doc from the home page, see it appear in the list, click it (404 for now is fine).

### Level 3 — Editor page: shell + title + save
- Build `Editor.jsx` with Sidebar + Navbar layout
- Editable title input
- `GET /api/docs/:id` on mount
- `PATCH /api/docs/:id` on title blur/Enter
- `SaveIndicator` showing save state
- `← Back` link
- No TipTap yet — just the shell with a plain `<textarea>` placeholder

**Check:** Navigate to `/doc/:id`, see the title, edit it, it saves.

### Level 4 — TipTap integration
- Install packages
- Build `TipTapEditor.jsx` with all extensions
- Replace `<textarea>` with TipTap
- Wire content load (from `doc.content`) and auto-save (debounced 1.5s)
- Add ProseMirror CSS overrides to `index.css`

**Check:** Type in the editor, bold/italic work, content persists on refresh.

### Level 5 — Toolbar
- Build `EditorToolbar.jsx`
- Wire all buttons to TipTap commands
- Active states work correctly

**Check:** All toolbar buttons work, active state highlights correctly.

### Level 6 — Polish
- Smooth transitions on save indicator
- Empty state on home looks clean
- Document title updates in the Navbar tab as user edits it
- Word count shows correctly
- Relative timestamps on doc cards ("Edited 2m ago" etc.)

**Check:** Full flow — create doc, write, see it on home, re-open, content is there.

---

## Relative Time Helper

Add this utility (used in Home.jsx for card timestamps):

```js
// src/utils/relativeTime.js
export function relativeTime(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `Edited ${mins}m ago`;
  if (hours < 24) return `Edited ${hours}hr${hours > 1 ? "s" : ""} ago`;
  return `Edited ${days}d ago`;
}
```

---

## New Route in App.jsx

```jsx
import Editor from "./pages/Editor";
// ...
<Route path="/doc/:id" element={<Editor />} />
```

---

## Notes for Claude Code

1. **Document card thumbnails are gone** — no more Figma thumbnail images for user docs. Use a clean dark card with the doc title inside. The Figma thumbnail assets were placeholder design only.
2. **TipTap content is stored as JSON** (`editor.getJSON()`) — not HTML. Store and retrieve as JSON object.
3. **Auto-save is debounced** — do NOT save on every keystroke. Use `setTimeout` / `clearTimeout` pattern, 1500ms delay.
4. **Title save** — on `blur` (clicking away) OR pressing `Enter` (which should `blur` the input, not insert newline).
5. **Owner check** — backend must verify `doc.owner.toString() === req.user.id` before any read/write/delete.
6. **`GET /api/docs` returns no `content` field** — content is large JSON, only fetch it on the editor page via `GET /api/docs/:id`.
7. **Navbar active tab** — on the Editor page, the active tab should show the current document title (not "Untitled 1" hardcoded). Pass the live title as a prop to Navbar.
8. **Do not break onboarding** — App.jsx route additions must not disturb existing routes.
9. **Install TipTap packages in the frontend directory** — `cd vyrix-frontend-sample && npm install ...`
10. **This is investor-demo quality** — clean spacing, no layout bugs, smooth saves, nothing janky.

---

---

# Phase 6: Folders + File Organization

## Figma References
- Move File Modal: `https://www.figma.com/design/mtxT4Ux2foUfsTDkMNfnel/Vyrix-UI-Design?node-id=71-2017`
- In Folder view: `https://www.figma.com/design/mtxT4Ux2foUfsTDkMNfnel/Vyrix-UI-Design?node-id=115-714`
- Move modal screenshot: `https://www.figma.com/api/mcp/asset/bcb6c504-204a-4aad-a7a9-02555265e323`
- In Folder screenshot: `https://www.figma.com/api/mcp/asset/aceb9edc-c9da-4422-98ea-bcefb9590d3c`

## Overview

This phase makes the "Your Projects" section real and adds full file organization. By end of phase:

- Clicking **"New folder"** opens an inline name input and creates a real folder
- **"Your Projects"** shows the user's actual folders from the DB
- Clicking a folder opens **`/folder/:id`** — shows its documents in the same app shell
- The **"Move file" modal** (from Figma design) lets users move any document into a folder
- The move button appears as one of the two hover action buttons on each document card
- Documents can belong to one folder (`folder` field, nullable)
- Folder page shows breadcrumb: `Home > FolderName`

---

## Folder Icon Asset

```js
const imgFolderIcon = "https://www.figma.com/api/mcp/asset/1215f116-0efb-4807-afb6-a33d26da873c";
```

---

## Backend — Phase 6 Changes

### 1. New Folder Model
**New file:** `src/models/folder.model.js`

```js
const mongoose = require("mongoose");
const folderSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "user-data", required: true },
}, { versionKey: false, timestamps: true });

module.exports = mongoose.model("folder", folderSchema);
```

### 2. Update Document Model
**File:** `src/models/document.model.js`

Add a `folder` field:
```js
folder: { type: mongoose.Schema.Types.ObjectId, ref: "folder", default: null },
```

### 3. Folder Controller
**New file:** `src/controllers/folder.controller.js`

```js
// createFolder   → POST /api/folders
//   body: { name }
//   Creates folder with owner = req.user.id
//   Returns { folder: { _id, name, createdAt } }

// getMyFolders   → GET /api/folders
//   Returns all folders where owner = req.user.id, sorted by createdAt desc
//   Each folder includes docCount (count of docs in that folder)
//   Returns { folders: [{ _id, name, docCount, createdAt }] }

// getFolderDocs  → GET /api/folders/:id/docs
//   Returns all documents where folder = id AND owner = req.user.id
//   Sorted by updatedAt desc
//   Returns { folder: { _id, name }, docs: [{ _id, title, updatedAt }] }

// renameFolder   → PATCH /api/folders/:id
//   body: { name }
//   Returns { folder: { _id, name } }

// deleteFolder   → DELETE /api/folders/:id
//   Deletes folder, sets folder=null on all docs in that folder
//   Returns { message }
```

### 4. Update Document Controller
**File:** `src/controllers/document.controller.js`

Add `moveDocument`:
```js
// moveDocument → PATCH /api/docs/:id/move
//   body: { folderId } — folderId can be null (remove from folder)
//   Verifies folderId belongs to same user if not null
//   Sets doc.folder = folderId
//   Returns { doc: { _id, title, folder } }
```

### 5. Folder Routes
**New file:** `src/routes/folder.routes.js`

```js
router.use(authUser);
router.post("/",           folderController.createFolder);
router.get("/",            folderController.getMyFolders);
router.get("/:id/docs",    folderController.getFolderDocs);
router.patch("/:id",       folderController.renameFolder);
router.delete("/:id",      folderController.deleteFolder);
```

Add to document routes:
```js
router.patch("/:id/move",  docController.moveDocument);
```

### 6. Register in app.js
```js
const folderRoutes = require("./routes/folder.routes");
app.use("/api/folders", folderRoutes);
```

### 7. API Summary

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | `/api/folders` | `{ name }` | `{ folder }` |
| GET | `/api/folders` | — | `{ folders: [{ _id, name, docCount }] }` |
| GET | `/api/folders/:id/docs` | — | `{ folder, docs }` |
| PATCH | `/api/folders/:id` | `{ name }` | `{ folder }` |
| DELETE | `/api/folders/:id` | — | `{ message }` |
| PATCH | `/api/docs/:id/move` | `{ folderId }` | `{ doc }` |

---

## Frontend — Phase 6 Changes

### New files
```
src/
├── pages/
│   └── Folder.jsx                        ← /folder/:id
├── components/
│   └── home/
│       ├── MoveModal.jsx                 ← move-to-folder modal
│       └── NewFolderInput.jsx            ← inline name input for creating folder
```

### Modified files
```
src/components/home/ProjectsSection.jsx   ← live folders, "New folder" creates real folder
src/components/home/DocumentCard.jsx      ← move button triggers MoveModal
src/pages/Home.jsx                        ← fetch real folders, pass to ProjectsSection + MoveModal
src/App.jsx                               ← add /folder/:id route
```

---

## Design Breakdown

### ProjectsSection — live folders

Replace hardcoded folders with real API data. Each folder item:
- Folder icon: `imgFolderIcon` — `w-[78px] h-[64px] shadow-[0px_6px_12px_rgba(0,0,0,0.4)]`
- Name: `text-[15px] text-white font-bold`
- Count: `text-[11px] text-[#8d8d97]` — `"{n} items"`
- `onClick` → `navigate('/folder/:id')`

**"New folder" button** — clicking opens `NewFolderInput` inline:
- Replaces the "New folder" placeholder with a small `<input>` in the same slot
- `w-[108px] h-[64px] rounded-[9px] border border-[rgba(178,197,242,0.3)] bg-transparent text-center text-[13px] text-white outline-none placeholder-[#4a4a5a]`
- `placeholder="Folder name"`
- On `Enter` or blur with value → `POST /api/folders { name }` → add to folders list → close input
- On `Escape` or blur with empty → close input without creating
- `autoFocus` when rendered

### MoveModal — from Figma node 71:440

A centered modal overlay. Exact design from Figma:

**Overlay backdrop:**
`fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center z-50`

**Modal container:**
`w-[413px] bg-[rgba(12,12,24,0.91)] border border-[rgba(140,140,140,0.5)] rounded-[22px] overflow-hidden shadow-[0px_40px_100px_rgba(0,0,0,0.6)]`

**Header section** (bottom border `rgba(150,150,165,0.16)`):
- `"Move "` + `docTitle` in `#b2c5f2` — `font-bold text-[18.6px] text-white`
- `"Currently in"` label + location: `text-[12.7px] text-[#8d8d97]` + `text-[#c7c7c7]`
  - Location text: `"Recent · No folder"` if no folder, or folder name if in one
- Close `×` button: `absolute top-3 right-3 w-[33px] h-[33px] bg-[rgba(255,255,255,0.05)] border border-[rgba(150,150,165,0.16)] rounded-[10px] text-white text-[16px]`

**Search input:**
`mx-[27px] mt-[8px] border border-[#dcdcdc] rounded-[13px] px-[16px] py-[13px] flex items-center gap-3`
- Search icon SVG (small magnifier)
- `<input placeholder="Search folders…" className="flex-1 bg-transparent text-[13.7px] text-[#7e7e8c] outline-none" />`

**Folder list** (scrollable, max-height `294px`):
Each folder row `flex items-center gap-[14.7px] px-[14.7px] py-[13.72px] rounded-[13px] hover:bg-[rgba(255,255,255,0.04)] cursor-pointer`:
- Folder icon: `w-[41px] h-[33px]` using `imgFolderIcon`
- Folder name: `text-[14.7px] text-white font-bold`
- Sub text: `text-[12px] text-[#8d8d97]` — `"{docCount} projects · edited X ago"`
- Radio circle (right): `w-[21.56px] h-[21.56px] rounded-[10.78px] border-2 border-[#5a5a6e]` — filled `bg-[#b2c5f2]` when selected

**"Create new folder" row** (at bottom of list):
- Dashed box `w-[41px] h-[33px] border border-dashed border-[rgba(178,197,242,0.5)] rounded-[9px]` with `+` in `#b2c5f2`
- Label: `text-[14.7px] text-[#b2c5f2] font-bold` — `"Create new folder"`
- Clicking this: inline input appears (same pattern as ProjectsSection new folder)

**Footer** (top border `rgba(150,150,165,0.16)`):
`flex justify-end gap-3 px-[27px] py-[19px]`
- `"Cancel"` button: `border border-[rgba(140,140,140,0.5)] rounded-[13px] px-[24px] py-[12px] text-[14.2px] text-[#d5d5d5] font-bold`
- `"Move here"` button: `bg-[#b2c5f2] rounded-[13px] px-[24px] py-[12px] text-[14.2px] text-black font-bold`
  - Disabled (opacity-40) when no folder selected
  - Active when a folder is selected

**Props:**
```jsx
// <MoveModal
//   isOpen={bool}
//   onClose={() => {}}
//   docId={string}
//   docTitle={string}
//   currentFolder={null | { _id, name }}
//   folders={[{ _id, name, docCount, updatedAt }]}
//   onMoved={(docId, folderId) => {}}  ← called after successful move
// />
```

**On "Move here" click:**
```js
await api.patch(`/api/docs/${docId}/move`, { folderId: selectedFolderId });
onMoved(docId, selectedFolderId);
onClose();
```

### DocumentCard — move button

The second hover button (currently a `•••` dots icon) now opens the MoveModal:

```jsx
// Second hover button onClick:
onMoveClick?.()  // calls setMovingDoc({ id: doc._id, title: doc.title }) in parent
```

Pass `onMoveClick` as a prop to `DocumentCard`.

In `Home.jsx`, manage move modal state:
```js
const [movingDoc, setMovingDoc] = useState(null); // { id, title, currentFolder }
```

### Folder Page — `/folder/:id`

**Layout:** identical to Home — same `Sidebar` + `Navbar` shell.

**Content area (from "In Folder" Figma frame):**
- **Breadcrumb** at top: `"Home > {folderName}"` — `text-[20px] text-[#dcdcdc] font-[590]`
  - `"Home"` is a clickable link → `navigate('/home')`
  - `">"` separator in `#8d8d97`
  - `folderName` in `#dcdcdc`
- **Documents grid** below breadcrumb — same `DocumentCard` components with `size="small"`
- **"New folder"** add button at end of row (same as home, creates sub-folder — skip for now, just show as disabled `opacity-40`)
- **"Create new project"** button with white border box (from Figma: `border border-white rounded-[20px] h-[167px] w-[267px]` with "Create new project" text centered) — clicking creates new doc in this folder:
  ```js
  const { data } = await api.post("/api/docs");
  await api.patch(`/api/docs/${data.doc._id}/move`, { folderId: id });
  navigate(`/doc/${data.doc._id}`);
  ```
- **Empty state** if no docs in folder:
  ```jsx
  <div className="flex h-[191px] w-full flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-[rgba(178,197,242,0.15)]">
    <div className="text-[28px]">📂</div>
    <p className="text-[14px] text-[#4a4a5a]">This folder is empty</p>
    <p className="text-[12px] text-[#3a3a4a]">Create a new project or move files here</p>
  </div>
  ```

**`Folder.jsx` data fetching:**
```js
// On mount:
Promise.all([
  api.get("/api/auth/me"),
  api.get(`/api/folders/${id}/docs`),
])
// → setUser, setFolder({ _id, name }), setDocs([...])
// → if 404/403 → navigate('/home')
```

---

## Build Plan — Level by Level

### Level 1 — Backend: Folder model + controller + routes + doc move endpoint
Build the full folder API and the move endpoint. Test all routes with REST client.

**Check:** Create folder, list folders, get folder docs, move a doc into a folder, delete folder.

### Level 2 — Home: Live folders in ProjectsSection + "New folder" inline input
- Fetch `GET /api/folders` alongside the existing Home data calls
- Replace hardcoded folders with real data
- "New folder" button → shows `NewFolderInput` → creates folder → adds to list
- Folder click → `navigate('/folder/:id')`
- Pass `folders` array and `onFolderCreated` handler through to `ProjectsSection`

**Check:** Create a folder from Home, see it appear, click it (placeholder page is fine).

### Level 3 — Folder page (`/folder/:id`)
Build `Folder.jsx` with full layout from Figma.
- Breadcrumb, doc cards, empty state, create-new-project-in-folder button
- Same Sidebar + Navbar shell, `activePage="folder"` for sidebar

**Check:** Navigate to a folder, see its docs, create a new doc inside it.

### Level 4 — Move Modal
Build `MoveModal.jsx` from the Figma design exactly.
- Search filtering works
- Folder selection with radio circle
- "Move here" calls API and closes
- "Create new folder" inline input inside the modal

Wire the second hover button on `DocumentCard` to open it.
In `Home.jsx`, manage `movingDoc` state + pass to MoveModal.

**Check:** Hover a doc card, click move button, modal opens, select a folder, click "Move here", doc disappears from home recent and appears in that folder.

### Level 5 — Polish + cleanup
- After moving a doc, refresh the docs list in Home (remove moved doc from recent if it's in a folder, or keep it — designer decision: keep it in recent)
- Folder doc count updates after move
- Add `/folder/:id` to App.jsx
- Sidebar `activePage` updates correctly (Home vs Folder)
- Empty states for both Home (no docs) and Folder (no docs in folder) look clean

**Check:** Full flow — create folder, create doc, move doc to folder, open folder, see doc, click doc → editor opens.

---

## New Route in App.jsx

```jsx
import Folder from "./pages/Folder";
// ...
<Route path="/folder/:id" element={<Folder />} />
```

---

## Notes for Claude Code

1. **Folder icon** is the same `imgFolderIcon` asset used in Phase 4 — reuse it
2. **`NewFolderInput`** is a tiny component — it can live inside `ProjectsSection.jsx` directly, no need for a separate file unless it grows
3. **Move modal search** — filter the `folders` array client-side by name, no API call needed
4. **`docCount`** in folder listing — calculate in the backend using `Document.countDocuments({ folder: folder._id, owner: req.user.id })`
5. **After moving a doc** — keep it in Recent Activity on Home (it's still recent). Only filter it out when viewing a specific folder's contents
6. **Do not break** the editor, onboarding, or existing home functionality
7. **`activePage` prop** for Sidebar — add `"folder"` as a valid value, no nav item highlighted (or highlight "Home" since folders are under Home)
8. **Build level by level** — stop after each level and report

---

---

# Phase 7: All Files Page + Cover Images + Navbar Navigation

## Figma Reference
- All Files: `https://www.figma.com/design/Y8LjNhIWs64XrGFcR9eSnV/Vyrix-UI-Design?node-id=98-1290`
- Screenshot: `https://www.figma.com/api/mcp/asset/db6b9741-e6a1-460f-a93b-56cb52a2f6cc`

## Overview

This phase does three things:

1. **All Files page** (`/all-files`) — a complete view of every document + folder the user owns, sortable, with Repository Files panel (arriving soon) and a Create new project button
2. **Navbar navigation** — wire the existing navbar tabs ("All Files", "Home", "Starred", "AI", "Community") to actually navigate
3. **Cover images** — every document card gets a randomly assigned cover image from a curated set, stored on the doc and displayed as the card thumbnail

---

## Cover Image System

### The cover image pool

These 4 images from the Figma design are the cover pool. Assign one randomly when a doc is created. Store the index (0–3) on the document model.

```js
// src/utils/coverImages.js  (frontend)
export const COVER_IMAGES = [
  "https://www.figma.com/api/mcp/asset/380532d0-57c1-49bf-a884-9b401c26bad3", // Rectangle 16
  "https://www.figma.com/api/mcp/asset/615bc289-a9ad-45e2-8a2c-353e88e8e06b", // Rectangle 17
  "https://www.figma.com/api/mcp/asset/aa97cafd-3b5b-4594-9879-52e6902a87dc", // Rectangle 18
  "https://www.figma.com/api/mcp/asset/149d3e21-d768-4ad3-ac14-af8a7cc720d5", // Rectangle 22
];

export function getRandomCoverIndex() {
  return Math.floor(Math.random() * COVER_IMAGES.length);
}

export function getCoverImage(index) {
  return COVER_IMAGES[index ?? Math.floor(Math.random() * COVER_IMAGES.length)];
}
```

### Backend — add `coverIndex` to Document model

```js
// In document.model.js — add field:
coverIndex: { type: Number, default: 0, min: 0, max: 3 },
```

### Backend — assign random cover on create

```js
// In document.controller.js createDocument:
const coverIndex = Math.floor(Math.random() * 4);
const doc = await Document.create({ title: "Untitled", content: {}, owner: req.user.id, coverIndex });
```

### Frontend — use cover image in DocumentCard

```jsx
// In DocumentCard.jsx — when thumbnail is null, use coverIndex:
// Props: { title, thumbnail, coverIndex, timestamp, size, onClick, onMoveClick }

import { getCoverImage } from "../../utils/coverImages";

// In the card render:
const coverSrc = thumbnail || getCoverImage(coverIndex);

// Render:
<img src={coverSrc} alt="" className="absolute inset-0 w-full h-full object-cover rounded-[20px]" />
```

### Pass coverIndex everywhere docs are rendered

In `Home.jsx`, `Folder.jsx`, and `AllFiles.jsx`:
```jsx
<DocumentCard
  key={doc._id}
  title={doc.title}
  coverIndex={doc.coverIndex}  // ← add this
  timestamp={relativeTime(doc.updatedAt)}
  size="small"
  onClick={() => navigate(`/doc/${doc._id}`)}
  onMoveClick={...}
/>
```

---

## All Files Page (`/all-files`)

### Layout — from Figma (1920×1080)

Same Sidebar + Navbar shell. **"All Files"** is the active item in sidebar (`bg-[#b2c5f2] text-black`).

**Page heading area (y=93–424):**

Left side:
- `"Your Projects"` heading — `Unbounded, 40px, #e7e7e7` (top-left of content)
- `"Folders"` label — `20px, #d5d5d5, font-[590]` at `y=200`
- Folders row — same component as `ProjectsSection` (real folders from API), `y=256`
- `"Sort By"` pill + dropdown at `y=111`:
  - Pill: `bg-[rgba(14,16,34,0.62)] border border-[#a6a6a6] rounded-[15px] px-3 py-1 flex items-center gap-2`
  - `"Sort By"` text: `20px white font-[510]`
  - `"Date Created"` with chevron: `15px white` — clicking cycles sort: Date Created → Name (A–Z) → Last Edited
- Horizontal divider line at `y=424` — `w-full h-[1px] bg-[rgba(255,255,255,0.06)]`
- `"All Projects"` heading below divider — `Unbounded, 32px, #d5d5d5`

Right side (top-right panel):
- **Repository Files** card — `x=1202, y=93, w=666, h=290`
  - `bg-[rgba(12,12,24,0.11)] rounded-[20px] shadow-[1px_4px_7.7px_5px_rgba(0,0,0,0.25)]`
  - `"Repository Files"` heading — `SF Pro Bold, 32px, #d5d5d5`
  - "Recently Uploaded" label + underline
  - 3 file type icons (pdf, photo, link) from Figma assets + "Research Paper 3" labels + "Pdf" type
  - **"Open Repo"** text link: `12px, #d5d5d5` — clicking shows "Arriving soon" toast
  - box1 icon (folder+link) at top-right of card
  - Entire section has **"Arriving Soon"** overlay on hover — semi-transparent dark overlay with the same "Arriving soon" badge style used elsewhere in the app
  - In default state: render it as-is from design (static, non-interactive except "Open Repo")

**Documents grid (y=535+):**

- `"Create new project"` white-bordered box `w-[267px] h-[167px]` (same as Folder page) — at start of grid
- All user documents as `DocumentCard` components with `size="small"` and cover images
- Each row of 5 cards with `gap-[18px]`
- Sorted by the active sort option

**Sort logic (client-side):**
```js
// sortBy state: 'date_created' | 'name' | 'last_edited'
const sorted = [...docs].sort((a, b) => {
  if (sortBy === 'name')         return a.title.localeCompare(b.title);
  if (sortBy === 'last_edited')  return new Date(b.updatedAt) - new Date(a.updatedAt);
  return new Date(b.createdAt) - new Date(a.createdAt); // date_created (default)
});
```

### Cover image assets (for AllFiles page)

```js
// These are already in the COVER_IMAGES array above
// Also used as card thumbnails in AllFiles
```

### Repository Files assets

```js
const imgPdf1   = "https://www.figma.com/api/mcp/asset/b8432742-8173-446b-8635-f7b9972f2945";
const imgPhoto1 = "https://www.figma.com/api/mcp/asset/a05f6f2a-cf2d-4f28-85f2-32f29cb367b4";
const imgLink1  = "https://www.figma.com/api/mcp/asset/b1cbfe2a-c104-4da9-9684-9e657f4867de";
const imgBox1   = "https://www.figma.com/api/mcp/asset/92546667-6069-4a1c-b6ab-3af3d9ceb478";
```

---

## Navbar Navigation — wire the sidebar items

Currently all sidebar nav items are static. Wire them up:

| Sidebar item | Action |
|-------------|--------|
| Home | `navigate('/home')` |
| All Files | `navigate('/all-files')` |
| Starred | show "Arriving soon" toast |
| AI | show "Arriving soon" toast |
| Community | show "Arriving soon" toast |

**"Arriving soon" toast** — a small floating notification:
```jsx
// Simple toast component — shows for 2.5s then disappears
// Position: bottom-right of screen, fixed
// Style: bg-[rgba(20,24,46,0.9)] border border-[rgba(178,197,242,0.32)] rounded-[11px] px-4 py-3
// Text: "Arriving soon" in #b2c5f2, 13px, bold
// With a small clock/time icon or the same bell icon from the Teamspace panel
```

Add `useToast` hook or simple `showToast` state to `Sidebar.jsx`:
```js
const [toast, setToast] = useState(false);
const showArrivingSoon = () => {
  setToast(true);
  setTimeout(() => setToast(false), 2500);
};
```

**`activePage` updates:**
- `Home.jsx` → `activePage="home"`
- `AllFiles.jsx` → `activePage="allfiles"`
- `Folder.jsx` → `activePage="home"` (folders are under Home)
- `Editor.jsx` → `activePage="allfiles"` (or keep as `home` — both are fine)

Update `Sidebar.jsx` to highlight `"All Files"` when `activePage === "allfiles"`.

---

## New Files

```
src/
├── pages/
│   └── AllFiles.jsx              ← /all-files
├── utils/
│   └── coverImages.js            ← cover image pool + helpers
```

---

## New Route in App.jsx

```jsx
import AllFiles from "./pages/AllFiles";
<Route path="/all-files" element={<AllFiles />} />
```

---

## Build Plan — Level by Level

### Level 1 — Cover image system
- Add `coverIndex` field to Document model (backend)
- Assign random `coverIndex` on `createDocument`
- Create `src/utils/coverImages.js` with `COVER_IMAGES`, `getRandomCoverIndex`, `getCoverImage`
- Update `DocumentCard.jsx` to accept `coverIndex` prop and use `getCoverImage(coverIndex)` when no thumbnail
- Update all places that render `DocumentCard` to pass `coverIndex={doc.coverIndex}`

**Check:** Create a new doc, go to home — card shows a cover image instead of black.

### Level 2 — All Files page shell + Folders section + Sort
- Create `AllFiles.jsx` with Sidebar + Navbar shell
- Heading `"Your Projects"` (Unbounded 40px)
- Fetch `GET /api/docs` and `GET /api/folders` in parallel on mount
- Render Folders row (reuse `ProjectsSection` or inline same pattern)
- Sort By pill — cycles through 3 sort options on click, sorts the docs array
- Horizontal divider + `"All Projects"` heading below

**Check:** `/all-files` loads, folders appear, sort by cycles through options.

### Level 3 — All Files documents grid + Create new project
- Render sorted docs grid below `"All Projects"` heading
- `"Create new project"` white-bordered box at start of grid
- Each doc as `DocumentCard` with cover image, title, timestamp, move button
- `MoveModal` integrated same as Home
- Empty state if no docs

**Check:** All docs show with cover images, sort works, create from All Files navigates to editor.

### Level 4 — Repository Files panel (static + arriving soon)
- Build the Repository Files card exactly from Figma
- Static — render the 3 file type icons, labels, "Open Repo" link
- "Open Repo" click → shows "Arriving soon" toast
- Hover state shows subtle overlay (optional — can skip hover, just static)

**Check:** Repository Files panel renders correctly in top-right of the page.

### Level 5 — Sidebar navigation + toast
- Wire all sidebar nav items to navigate or show toast
- Add `showArrivingSoon` toast in `Sidebar.jsx`
- Toast appears for 2.5s then fades out
- `activePage` correctly highlights the right item on each page

**Check:** Click "All Files" in sidebar → navigates. Click "Starred" → toast shows "Arriving soon".

---

## Notes for Claude Code

1. **`coverIndex` is stored on the backend** — every new doc gets a random 0–3 value. Frontend reads it and maps to the URL.
2. **`DocumentCard` change is backwards compatible** — `thumbnail` prop still works. `coverIndex` is only used when `thumbnail` is null/undefined.
3. **All Files page reuses existing components** — `ProjectsSection`, `DocumentCard`, `MoveModal`. Don't duplicate logic.
4. **Repository Files is purely static** — no backend, no real uploads. It's a UI preview of a future feature.
5. **Sort is client-side** — no new API. Just sort the docs array in state before rendering.
6. **"Arriving soon" toast is reusable** — put the logic in `Sidebar.jsx` for now, no need for a global toast system yet.
7. **Do not break** Home, Folder, Editor, or any onboarding flows.
8. **Build level by level** — stop after each level and report.

---

---

# Phase 8: Project Page — Overview, Documents, Flow Repository

## Figma References

| Screen | Node | Description |
|--------|------|-------------|
| Empty Project (from All Files) | `298:2477` | Project page, no docs, no description yet |
| Empty Project (from Home) | `298:2929` | Same but breadcrumb says `Home > ProjectName` |
| Project with files | `131:588` | Project page with docs, Flow Repository panel filled |
| Flow Repository (full view) | `298:3132` | Flow view with nodes + Show in Flow toggle + Edit Flow |
| Flow > Uploaded Files | `298:3401` | Inside a specific flow, showing uploaded files |

Screenshots:
- Empty (All Files): `https://www.figma.com/api/mcp/asset/812dd10e-98e6-45c6-862b-e1cc899beb7d`
- Empty (Home): `https://www.figma.com/api/mcp/asset/877cd857-7668-48f4-a1f1-fb121e8491fe`
- With files: `https://www.figma.com/api/mcp/asset/6ecdbab6-7d6f-4e55-b927-24dd8c295b12`
- Flow Repository: `https://www.figma.com/api/mcp/asset/34a792fe-dbd8-41a3-8010-62835a0110d6`
- Uploaded Files in Flow: `https://www.figma.com/api/mcp/asset/cd8c4236-ac76-48dc-993a-486679e0a4de`

---

## Overview — What changes in this phase

Currently clicking a document card from Home or All Files opens the **TipTap editor** (`/doc/:id`) directly. This phase **replaces that behaviour**. Instead, clicking a document card opens a **Project page** (`/project/:id`) that has:

1. **Project header** — editable title (inline, large), cover image icon, breadcrumb that knows where you came from (Home or All Files)
2. **Description** — editable multi-line text, saved on blur
3. **Documents tab** — the TipTap editor is accessed from here via a **"Create Document"** button. Other attached files (PDFs, links, Canva, Figma) are also listed here. Sort by control.
4. **Flow Repository panel** (top-right) — initially empty. Has a "Show in Flow" toggle and "Edit Flow" button. When you add flows and files, they appear here as connected nodes.

The TipTap editor still exists at `/doc/:id` and is opened from inside the Project page, not directly from home.

---

## New Route

```
/project/:id     ← Project overview page (this phase)
/doc/:id         ← TipTap editor (already exists — keep as is)
```

`App.jsx` update:
```jsx
import Project from "./pages/Project";
<Route path="/project/:id" element={<Project />} />
```

---

## Navigation change — clicking doc cards

**Before:** `onClick={() => navigate('/doc/${doc._id}')}`
**After:** `onClick={() => navigate('/project/${doc._id}')}`

Update this in:
- `Home.jsx` (GreetingHeader doc cards + Recent Files row)
- `AllFiles.jsx` (All Projects grid)
- `Folder.jsx` (folder docs grid)

The Project page itself has a "Create Document" button that opens `/doc/:id`.

---

## Breadcrumb logic

The breadcrumb must reflect where the user came from:
- From Home → `Home > ProjectTitle`
- From All Files → `All files > ProjectTitle`
- From a Folder → `FolderName > ProjectTitle`

Pass `source` as a URL query param when navigating:
```js
// From Home:
navigate(`/project/${doc._id}?source=home`)
// From All Files:
navigate(`/project/${doc._id}?source=allfiles`)
// From Folder:
navigate(`/project/${doc._id}?source=folder&folderName=August`)
```

In `Project.jsx`, read with `useSearchParams()`:
```js
const [searchParams] = useSearchParams();
const source = searchParams.get("source") || "home";
const folderName = searchParams.get("folderName") || "";
```

Breadcrumb render:
```jsx
// source === "home"     → "Home > {title}"    (Home is a link → /home)
// source === "allfiles" → "All files > {title}" (All files → /all-files)
// source === "folder"   → "{folderName} > {title}" (folder name → navigate back)
```

---

## Backend — Phase 8 Changes

### Update Document Model
**File:** `src/models/document.model.js`

Add new fields:
```js
description: { type: String, default: "" },
attachments:  { type: Array, default: [] },
// Each attachment: { id, type, name, url, createdAt }
// type: 'document' | 'pdf' | 'link' | 'canva' | 'figma'

flows: { type: Array, default: [] },
// Each flow: { id, name, files: [{ id, name, type, url }] }
// flows are ordered — position matters for drag/swap
```

### Update Document Controller
**File:** `src/controllers/document.controller.js`

Add endpoints:

```js
// PATCH /api/docs/:id/description
//   body: { description }
//   Saves the project description
//   Returns: { doc: { _id, description } }

// POST /api/docs/:id/attachments
//   body: multipart — file OR { type: 'link'|'canva'|'figma', name, url }
//   For file uploads: store name, type from mimetype, generate URL (use ImageKit or just save locally)
//   For links: store as { type: 'link', name, url }
//   Appends to doc.attachments array
//   Returns: { attachment }

// DELETE /api/docs/:id/attachments/:attachmentId
//   Removes from doc.attachments
//   Returns: { message }

// POST /api/docs/:id/flows
//   body: { name }
//   Creates a new flow with that name, appends to doc.flows
//   Returns: { flow: { id, name, files: [] } }

// POST /api/docs/:id/flows/:flowId/files
//   body: multipart OR { type: 'link'|'canva'|'figma', name, url }
//   Adds a file to the specific flow
//   Returns: { file }

// DELETE /api/docs/:id/flows/:flowId
//   Removes a flow
//   Returns: { message }

// PATCH /api/docs/:id/flows/reorder
//   body: { flowIds: [id1, id2, id3] } — ordered list
//   Reorders doc.flows to match the provided order
//   Returns: { flows }
```

Add routes in `document.routes.js`:
```js
router.patch("/:id/description",                  docController.updateDescription);
router.post("/:id/attachments",                   upload.single("file"), docController.addAttachment);
router.delete("/:id/attachments/:attachmentId",   docController.removeAttachment);
router.post("/:id/flows",                         docController.createFlow);
router.post("/:id/flows/:flowId/files",           upload.single("file"), docController.addFileToFlow);
router.delete("/:id/flows/:flowId",               docController.removeFlow);
router.patch("/:id/flows/reorder",                docController.reorderFlows);
```

For file uploads, use `multer` with memory storage (store to a temp buffer). Since ImageKit is already configured, upload via the existing `storage.service.js`. If ImageKit is not ready, just save file metadata without an actual URL for now.

---

## Frontend — Project Page

### `src/pages/Project.jsx`

**Layout:** Same Sidebar + Navbar shell. `activePage` comes from `source`.

**Content area structure (left ~60%, right ~40%):**

```
┌─────────────────────────────────────────────────────────────────┐
│  Sidebar    │   [Navbar tabs]                                    │
│             ├────────────────────────────────────────────────────│
│             │  All files > Untitled 1          (breadcrumb)      │
│             │  [cover icon]  Untitled 1        (title input)     │
│             │  ─────────────────────────────────────────────     │
│             │  Description                     (label)           │
│             │  Enter Description...            (textarea)        │
│             │  ─────────────────────────────────────────────     │
│             │  Documents                       (section label)   │
│             │  Sort By [Date Created ▾]        (sort pill)      │
│             │  [file cards grid]               (attachments)     │
│             │  [Add files button]                                 │
│             │  ─── right side ───                                │
│             │  [Flow Repository panel]         (top-right)       │
└─────────────────────────────────────────────────────────────────┘
```

**Full data fetch on mount:**
```js
Promise.all([
  api.get("/api/auth/me"),
  api.get(`/api/docs/${id}`),   // returns title, description, attachments, flows, coverIndex
])
```

---

## Project Page Layout — Detailed

### Top section (above the first divider, y=58–352)

**Left side (x=388–1047, i.e. ~60% width):**

- **Breadcrumb** — `y=102`: `"Home > Untitled 1"` or `"All files > August"`
  - `text-[16px] text-[#d5d5d5] font-[590]`
  - First part is a clickable link back to source
  - `" > "` separator in `#8d8d97`
  - Project title is current (non-link) — updates in real time as user types title

- **Cover icon** + **Title** — side by side at `y=140`:
  - Cover icon: `w-[62px] h-[62px] rounded-[11px]` — use `getCoverImage(doc.coverIndex)` — `object-cover`
  - Title `<input>`: `font-['Unbounded'] font-medium text-[38px] text-white bg-transparent border-none outline-none placeholder-[#4a4a5a]` — `placeholder="Untitled"`
  - On blur or Enter → `PATCH /api/docs/:id { title }`
  - `SaveIndicator` shows save status (reuse from Editor)

**Right side (x=1195–1920):**

- **Flow Repository panel** — `x=1195, y=58, w=725, h=293`
  - `bg-[rgba(12,12,24,0.11)] rounded-[20px] shadow-[1px_4px_7.7px_5px_rgba(0,0,0,0.25)]`
  - `"Flow Repository"` heading — `SF Pro Bold, 32px, #d5d5d5`
  - When `doc.flows.length === 0`: empty state — just heading + "No flows yet" subtext
  - When flows exist: "Recently Uploaded" label + file icons (from flow files)
  - Always shows `box1` icon top-right
  - This panel updates as flows/files are added below

---

### Second section (below first divider, y=352–end)

- **Description section** (y=219–352):
  - `"Description"` label — `14px, #d5d5d5, font-bold` at `y=219`
  - Description `<textarea>`: `w-[659px] min-h-[72px] bg-transparent border-none outline-none resize-none text-[15px] text-[#d5d5d5] placeholder-[#4a4a5a] leading-[1.6]`
  - `placeholder="Enter Description..."`
  - On blur → `PATCH /api/docs/:id/description { description }`
  - Auto-grows with content

- **Second divider** at `y=352` — `w-full h-[1px] bg-[rgba(255,255,255,0.06)]`

- **Documents section** (y=384+):
  - `"Documents"` label — `Unbounded-like, 20px, #d5d5d5, font-[590]` at `y=384`
  - `"Sort By"` pill same as All Files page
  - **File cards grid** — `flex flex-wrap gap-[18px]` starting at ~`y=443`
    - Each uploaded file/attachment as a `DocumentCard` with `size="small"`
    - File type cards (PDFs, links, Canva, Figma) shown as cards with cover images or type-specific icons
    - Clicking a "Create Document" type attachment → `navigate('/doc/${attachment.docId}')`
  - **"Add files" button** — bottom-right area:
    - `w-[108px] h-[39px]` button with `+` icon + `"Add files"` text
    - Clicking opens an **"Add File" dropdown menu** (see below)
  - **Empty state** when no attachments:
    - `"No Documents yet.."` centered text in `#d5d5d5, 16px`

---

## "Add Files" Dropdown Menu

From Figma `298:2929` — clicking "Add files" shows a popup menu:

```
┌─────────────────────────────┐
│  Create Document File       │   ← opens /doc/:id (creates TipTap doc, adds as attachment)
├─────────────────────────────┤
│  Make a file on Canva  [↗]  │   ← opens canva.com in new tab (placeholder)
├─────────────────────────────┤
│  Make a file on Figma  [↗]  │   ← opens figma.com in new tab (placeholder)
├─────────────────────────────┤
│  Add a link                 │   ← shows inline URL input
├─────────────────────────────┤
│  Add a file                 │   ← opens file picker (PDF, Word, etc.)
└─────────────────────────────┘
```

**Design:** `bg-[#1a1a2e] border border-[rgba(150,150,165,0.3)] rounded-[13px] w-[284px] shadow-xl`
Each row: `px-5 py-3 text-[16px] text-white hover:bg-[rgba(255,255,255,0.06)] cursor-pointer`
Dividers between rows: `h-[1px] bg-[rgba(255,255,255,0.08)]`
External link icons (Canva/Figma rows): small `[↗]` icon, `opacity-60`

**"Create Document File" action:**
```js
// Creates a new TipTap doc, attaches it to this project, navigates to editor
const { data } = await api.post("/api/docs");
await api.post(`/api/docs/${projectId}/attachments`, {
  type: "document",
  name: "Untitled",
  url: `/doc/${data.doc._id}`,
  docId: data.doc._id,
});
navigate(`/doc/${data.doc._id}?projectId=${projectId}`);
// projectId in query param lets editor show "Back to Project" instead of "Back to Home"
```

**"Add a link" action:**
- Inline: shows a small input below the button: `placeholder="https://..."`
- On Enter: `POST /api/docs/:id/attachments { type: 'link', name: url, url }`

**"Add a file" action:**
- Opens `<input type="file" accept=".pdf,.doc,.docx,.txt,.ppt,.pptx">`
- On select: `POST /api/docs/:id/attachments` as multipart
- Shows file name + type icon as a card

**"Canva" / "Figma" actions:**
- Opens `https://www.canva.com` or `https://www.figma.com` in a new tab
- Shows "In Development" toast for now

---

## Flow Repository Section

The Flow Repository panel is in the **top-right** of the Project page. It is **separate** from the Documents section.

### Empty state (no flows)
- Just the heading + "No flows yet" subtext
- An **"Add flow"** button: `w-[108px] h-[39px] bg-transparent border border-[rgba(178,197,242,0.3)] rounded-[9px] text-[#b2c5f2] text-[13px]` with `+` icon + `"Add flow"` text

### When flows exist — from Figma `131:588` and `298:3132`

The Flow Repository panel fills with:
- `"Recently Uploaded"` label + underline (from the most recently uploaded files across all flows)
- File icons (pdf, photo, link) — same style as Repository Files in All Files page
- `box1` icon (top-right corner of panel)

The content area **below** the panel also changes when flows exist:
- `"Show in Flow"` toggle — pill button `bg-[rgba(12,12,24,0.8)] border border-[#a6a6a6] rounded-[15px]` with a checkbox inside:
  - When **ON**: shows the connected flow diagram view (nodes connected by lines)
  - When **OFF**: shows the regular flat grid of document cards
- `"Edit Flow"` button — only visible when "Show in Flow" is ON — `bg-transparent border border-[rgba(178,197,242,0.3)] rounded-[9px] px-4 py-1 text-[14px] text-white`
  - When **Edit Flow is active**: flow nodes become draggable — user can swap their order
  - When clicked again: exits edit mode and saves the new order via `PATCH /api/docs/:id/flows/reorder`

### Flow diagram view (Show in Flow = ON)

From Figma `298:3132`:
- Full-width scrollable area `bg-[#1a1a2e] rounded-[20px] border border-[rgba(178,197,242,0.08)]`
- `"Flow Repository"` heading + folder icon + description text inside
- Each **flow** = a named box with connected doc card nodes under it
- Flow names are shown as labels above their nodes: "Pre Research", "Interview and surveys", "Research Materials", "Research Papers"
- Nodes are connected by lines (CSS borders, not SVG) showing hierarchy
- At the bottom of the flow area: scrollbar
- `"Add to Flow"` button: `w-[108px] h-[39px]` with `+` icon — creates a new flow via `POST /api/docs/:id/flows { name: "New Flow" }`

### Clicking a flow node → navigates to `/project/:id/flow/:flowId`

This is the "Uploaded Files" view from Figma `298:3401`:
- Breadcrumb: `"Flow Repository > Pre Research"`
- Flow name heading: `"Pre Research"` (Unbounded, large)
- Grid of uploaded files in this flow (pdf/photo/link cards same as documents)
- `"Add Files"` button → simplified dropdown:
  ```
  ┌──────────────────────────┐
  │  Add file from Computer  │
  ├──────────────────────────┤
  │  Add a link           [↗]│
  └──────────────────────────┘
  ```
- Scrollbar at bottom

---

## New Files

```
src/
├── pages/
│   └── Project.jsx                     ← /project/:id
├── components/
│   └── project/
│       ├── FlowRepository.jsx          ← top-right panel
│       ├── FlowDiagram.jsx             ← connected nodes view (Show in Flow = ON)
│       ├── FlowNode.jsx                ← individual draggable flow node
│       ├── AddFilesMenu.jsx            ← dropdown menu for adding files
│       └── AttachmentCard.jsx          ← single file card (pdf/link/canva/figma/doc)
├── pages/
│   └── FlowView.jsx                    ← /project/:id/flow/:flowId (uploaded files in a flow)
```

---

## Updated Editor.jsx

When editor is opened from a project (via `?projectId=...` query param):
- `← Back` link changes from `"Back to Home"` to `"Back to Project"` → `navigate('/project/${projectId}')`

```js
const [searchParams] = useSearchParams();
const projectId = searchParams.get("projectId");
// ...
<button onClick={() => navigate(projectId ? `/project/${projectId}` : "/home")}>
  ← {projectId ? "Back to Project" : "Back to Home"}
</button>
```

---

## Build Plan — Level by Level

### Level 1 — Backend: new doc fields + description + attachment endpoints
Add `description`, `attachments`, `flows` to Document model. Add `updateDescription` and `addAttachment`/`removeAttachment` controllers + routes. Test with REST client.

**Check:** `PATCH /api/docs/:id/description` saves description. `POST /api/docs/:id/attachments` with `{ type: 'link', name: 'test', url: 'https://example.com' }` adds to attachments array.

### Level 2 — Navigation change + Project page shell
- Change all doc card `onClick` in Home, AllFiles, Folder to navigate to `/project/:id` with correct `?source=` param
- Create `Project.jsx` shell with Sidebar + Navbar + data fetch
- Editable title (same pattern as Editor.jsx) with breadcrumb
- Flow Repository panel as placeholder (just the dark card with heading)
- No description or docs section yet

**Check:** Clicking a doc card from Home/AllFiles opens `/project/:id`. Breadcrumb says `Home > DocTitle` or `All files > DocTitle`. Title is editable and saves.

### Level 3 — Description + Documents section + Sort
- Add editable description textarea (auto-saves on blur)
- Documents section label + Sort By pill
- Render `doc.attachments` as a grid of `AttachmentCard` components
- Empty state when no attachments
- "Add files" button (no dropdown yet — just a placeholder)

**Check:** Description saves on blur. Empty state shows. Sort pill renders.

### Level 4 — "Add files" dropdown + file/link attachment
- Build `AddFilesMenu.jsx` dropdown
- Wire "Create Document File" → creates a new doc, adds attachment, navigates to editor
- Wire "Add a link" → inline URL input → saves attachment
- Wire "Add a file" → file picker → `POST /api/docs/:id/attachments` multipart
- Canva/Figma → open external link in new tab + "In Development" toast
- `AttachmentCard.jsx` renders each attachment type with appropriate icon

**Check:** All 5 menu options work. Files/links appear as cards. "Create Document File" navigates to editor and shows "Back to Project" on return.

### Level 5 — Flow Repository backend + empty/filled panel
- Add `createFlow`, `addFileToFlow`, `removeFlow`, `reorderFlows` to backend
- Build `FlowRepository.jsx` panel:
  - Empty state with "Add flow" button
  - When flows exist: "Recently Uploaded" files from all flows
- "Add flow" creates a flow via `POST /api/docs/:id/flows`
- Panel shows flow names in a simple list

**Check:** Create a flow, see it appear in the panel.

### Level 6 — Flow diagram + Show in Flow toggle + Edit Flow
- Build `FlowDiagram.jsx` — connected nodes view
- "Show in Flow" toggle shows/hides the diagram vs flat grid
- "Edit Flow" button enables drag-to-swap on flow nodes
- `FlowNode.jsx` — draggable when in edit mode, uses `onDragStart`/`onDrop` for swap
- On "Edit Flow" click again → save reorder via `PATCH /api/docs/:id/flows/reorder`

**Check:** Toggle works. Flow nodes render with names. Drag-swap reorders flows.

### Level 7 — Flow view page (`/project/:id/flow/:flowId`)
- New route `/project/:id/flow/:flowId` → `FlowView.jsx`
- Clicking a flow node navigates to this page
- Shows breadcrumb `"Flow Repository > FlowName"`
- Grid of files in that flow
- "Add Files" simplified dropdown (file + link only)
- "Add to Flow" button wired to flow-specific upload

**Check:** Click a flow node, enter flow view, add a file, it appears in the flow.

### Level 8 — Polish
- Breadcrumb "Back" arrow on project page and flow view
- `SaveIndicator` on title and description
- Attachment card hover actions (delete attachment)
- Flow Repository panel "Recently Uploaded" shows real files from flows
- Editor's `← Back` link correctly points to project when opened from project

---

## Notes for Claude Code

1. **The TipTap editor (`/doc/:id`) still exists** — it's just no longer opened directly from Home/AllFiles. It's opened from inside the Project page.
2. **`/project/:id` and `/doc/:id` are different** — the project page is the overview; the doc page is the writing surface.
3. **`source` query param** — always pass it when navigating to `/project/:id` so the breadcrumb is correct.
4. **Flows are stored inside the document** as an embedded array — no separate Mongoose model needed.
5. **File uploads** — use `multer` on the backend. For now, if ImageKit isn't wired up, just store the original filename and mime type. A real URL is not required for MVP.
6. **Flow drag-swap** — use plain HTML5 drag-and-drop (`draggable`, `onDragStart`, `onDragOver`, `onDrop`). No library needed. Only works when `isEditMode` is true.
7. **"In Development" toast** — reuse the same arriving-soon toast pattern already in Sidebar.jsx.
8. **Build level by level** — stop after each level and report. Do not do multiple levels in one go.
9. **Do not break** the existing Editor, Home, AllFiles, Folder, or onboarding flows.

---

---

# Phase 9: AI Page

## Figma Reference
- AI Page: `https://www.figma.com/design/Y8LjNhIWs64XrGFcR9eSnV/Vyrix-UI-Design?node-id=288-1399`
- Screenshot: `https://www.figma.com/api/mcp/asset/a52be3d3-c564-4dc2-9012-1bffd878da72`

## Overview

When the user clicks **"AI"** in the sidebar, it opens a new **tab** in the Navbar (labelled "AI") and navigates to `/ai`. The AI page is a research assistant chat interface — same Sidebar + Navbar shell as all other pages, but the content area is a full-height chat UI.

The page has:
1. **Gradient background** — same dark blue-purple gradient as the Home page (GRADIENT 1 from Figma — do NOT skip this, it's what makes the page look premium)
2. **Centered greeting** — `"Hi {firstName}! Lets get Started"` in Unbounded 40px centered in the viewport
3. **Suggestion pills** — 3 clickable prompt suggestions, each in its own bordered row, separated by horizontal lines
4. **Chat input bar** at the bottom — full width, white border, rounded corners, with a paperclip icon (left), a vertical divider line, `"Ask anything"` placeholder text, and a circular send button (right)
5. The chat messages area is empty on first load — just the greeting + suggestions are shown

---

## Layout Breakdown (1920×1080)

### Background layers
- Outer card: `bg-black rounded-[22px]` `x=29, y=27, w=1862, h=1027`
- Base: `bg-[rgba(0,0,0,0.2)]` full screen overlay
- **GRADIENT 1** (`x=339, y=35, w=1540, h=766`) — the signature dark blue-purple gradient:
  - Vector 1: large gradient blob, `opacity-92`, `h=385px` — asset `imgVector15`
  - Vector 4: second gradient blob, `opacity-92`, `h=205px` — asset `imgVector16`
  - Rectangle 2: `bg-size-[1024px_1024px] mix-blend-overlay opacity-92 rounded-[15px]` — asset `imgRectangle2`
  - Vector 5: bottom gradient, `opacity-92`, `h=285px` — asset `imgVector17`

  **In React, implement the gradient as:**
  ```jsx
  {/* GRADIENT 1 — identical to Home page gradient */}
  <div className="absolute left-[339px] top-[35px] w-[1540px] h-[766px] pointer-events-none">
    <div className="absolute" style={{ left: 0, top: 0, width: '100%', height: '385px', opacity: 0.92 }}>
      <img src={imgVector15} alt="" className="absolute block max-w-none w-full h-full" style={{ inset: '-77.92% -19.48%' }} />
    </div>
    <div className="absolute" style={{ left: '314px', top: '207px', width: '875px', height: '205px', opacity: 0.92 }}>
      <img src={imgVector16} alt="" className="absolute block max-w-none w-full h-full" style={{ inset: '-145.97% -34.29%' }} />
    </div>
    <div
      className="absolute rounded-[15px] mix-blend-overlay opacity-[0.92]"
      style={{ left: '4px', top: 0, width: '1536px', height: '766px', backgroundImage: `url("${imgRectangle2}")`, backgroundSize: '1024px 1024px', backgroundPosition: 'top left' }}
    />
    <div className="absolute" style={{ left: '4px', top: '224px', width: '1536px', height: '285px', opacity: 0.92 }}>
      <img src={imgVector17} alt="" className="absolute block max-w-none w-full h-full" style={{ inset: '-105.26% -19.53%' }} />
    </div>
  </div>
  ```

### Greeting text (centered in content area)
- Position: centered horizontally, `y=294` from top of frame (roughly vertical center-ish)
- Line 1: `"Hi {firstName}!"` — `font-['Unbounded'] font-medium text-[40px] text-[#e7e7e7] text-center`
- Line 2: `"Lets get Started"` — same style
- Both lines in one element, leading-tight

### Suggestion pills (y=775–988)
Two bordered sections:

**Top section** (`y=775, h=144`) — top border + left/right borders, `rounded-tl-[16px] rounded-tr-[16px]`:
- `border-t border-l border-r border-white opacity-60`
- Contains 2 suggestion rows separated by a horizontal line at `y=829` and `y=869`:
  - Row 1 (y=801): `"Lets find a new research paper today !"` — `text-[13px] text-[#adadad] font-normal`
  - Row 2 (y=841): `"Hello Ai! Lets start with a fresh topic"` — same style

**Bottom section** (`y=919, h=69`) — bottom border only, `rounded-bl-[16px] rounded-br-[16px]`:
- `border border-white opacity-60` (all sides but primarily bottom feel)
- Contains 1 suggestion row (y=877): `"Lets review our ongoing projects"` — same style

The full suggestions container spans `x=358, w=1513px`.

Each suggestion row is clickable — clicking it populates the chat input.

### Chat input bar (y=919–988)
- Full width: `x=358, w=1513px, h=69px`
- Container: `border border-white opacity-60 rounded-bl-[16px] rounded-br-[16px]` — this is the bottom section from above that also serves as the input container
- **Left side:**
  - Paperclip icon: `x=394, y=937, w=28, h=28` — asset `imgPaperclip1`
  - Vertical divider line at `x=462` — thin `w=1px, h=26px` line (`imgLine33`)
  - `"Ask anything"` placeholder text: `x=469, y=945` — `SF Pro Medium, 14px, #a0a0a0`
- **Right side:**
  - Send button: circular `w=45, h=45` at `x=1807, y=931` — `imgEllipse7` background + `imgGroup136` arrow icon inside

### Assets

```js
// AI Page specific assets
const imgVector15    = "https://www.figma.com/api/mcp/asset/5e9d9fff-f342-4fc8-9935-fdf30f756d9d"; // gradient blob 1
const imgVector16    = "https://www.figma.com/api/mcp/asset/681b0a60-697b-4d3c-9217-a6226e8244ac"; // gradient blob 2
const imgRectangle2  = "https://www.figma.com/api/mcp/asset/6ae41cb1-6ce2-4298-8fb3-4ce6728e76da"; // gradient overlay texture
const imgVector17    = "https://www.figma.com/api/mcp/asset/4fd2e9bf-07b3-4e7f-a344-aa28bcbee5c1"; // gradient blob 3
const imgPaperclip1  = "https://www.figma.com/api/mcp/asset/32ca8cdd-c98a-427d-8fe2-4a010d8b1ff6"; // paperclip icon
const imgEllipse7    = "https://www.figma.com/api/mcp/asset/48ac5656-8188-4153-b6e4-5a9d0a9b6fe0"; // send button bg circle
const imgGroup136    = "https://www.figma.com/api/mcp/asset/b3ff8f6f-a763-4c0c-ab15-3ccead31d3ef"; // send arrow icon
const imgLine33      = "https://www.figma.com/api/mcp/asset/251086dd-45a9-46c5-ba5a-cf5e973d5d93"; // vertical divider
```

---

## Navbar Tab Behaviour

When "AI" is clicked in the sidebar:
- A new tab labeled `"AI"` is added to the Navbar tab strip (same style as other tabs — `bg-[#b2c5f2] text-black` when active)
- Navigate to `/ai`
- The AI tab should appear and remain in the Navbar while the user is on the AI page
- Closing the tab (×) navigates back to `/home`

In `Sidebar.jsx`, update the "AI" nav item `onClick`:
```js
// Instead of showArrivingSoon():
onClick: () => navigate("/ai"),
```

In `Navbar.jsx`, add support for a dynamic `aiTab` prop:
```jsx
// Navbar already receives activeTabTitle from pages
// For the AI page, pass activeTabTitle="AI" to Navbar
// The active tab will show "AI" instead of a doc title
```

`activePage` for `AI.jsx` → `"ai"` — update Sidebar to highlight "AI" item when `activePage === "ai"`.

---

## Chat Functionality (UI only — no backend)

The AI page is **UI-only** for now. No actual AI API calls. The input accepts text, and when submitted, a mock response is shown. This is for the investor demo.

### State:
```js
const [messages, setMessages]   = useState([]); // { role: 'user'|'ai', text: string }
const [inputText, setInputText] = useState("");
const messagesEndRef = useRef(null);
```

### Message rendering (when messages exist):
- Replace the greeting + suggestions UI with the chat messages view
- User messages: right-aligned, `bg-[rgba(178,197,242,0.12)] border border-[rgba(178,197,242,0.2)] rounded-[16px] px-4 py-3 max-w-[60%] text-[15px] text-white`
- AI messages: left-aligned, `bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] px-4 py-3 max-w-[70%] text-[15px] text-[#e7e7e7]`
- Auto-scroll to bottom when new message added

### Mock AI response:
```js
const mockResponse = async (userMessage) => {
  // Simulate thinking delay
  await new Promise(r => setTimeout(r, 800));
  const responses = [
    "That's an interesting research direction. Let me help you explore that further.",
    "Based on your research context, here are some key areas to investigate...",
    "I can help you synthesize information on that topic. What specific aspect interests you most?",
    "Great question for your research. Consider exploring peer-reviewed sources on this.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};
```

### Submit handler:
```js
const handleSubmit = async () => {
  const text = inputText.trim();
  if (!text) return;
  setInputText("");
  setMessages(prev => [...prev, { role: "user", text }]);
  // Show AI typing indicator
  setMessages(prev => [...prev, { role: "ai", text: "...", typing: true }]);
  const response = await mockResponse(text);
  setMessages(prev => prev.map((m, i) =>
    i === prev.length - 1 && m.typing ? { role: "ai", text: response } : m
  ));
};
```

### Suggestion click:
```js
const handleSuggestion = (text) => {
  setInputText(text);
  // Auto focus the input
};
```

---

## New Files

```
src/
├── pages/
│   └── AI.jsx              ← /ai
```

---

## New Route in App.jsx

```jsx
import AI from "./pages/AI";
<Route path="/ai" element={<AI />} />
```

---

## Build Plan — Level by Level

### Level 1 — AI page shell + gradient + greeting
- Create `AI.jsx` with Sidebar + Navbar shell
- Add the full GRADIENT 1 background exactly as spec'd above — use asset URLs
- Centered greeting: `"Hi {firstName}! Lets get Started"` — read firstName from `/api/auth/me`
- `activePage="ai"` — update Sidebar "AI" item to navigate to `/ai` and highlight when active

**Check:** `/ai` loads, gradient is visible (dark blue-purple tones), greeting shows real firstName.

### Level 2 — Suggestion pills + horizontal line dividers
- Top bordered section: 2 suggestion rows with lines between them
- Bottom bordered section: 1 suggestion row (also serves as input container border)
- Exact border style: `border border-white opacity-60` with correct border-radius per section
- Suggestion text: `text-[13px] text-[#adadad]`
- Clicking a suggestion populates the input (wire in Level 3)

**Check:** 3 suggestion pills render with white borders, separated by horizontal lines, correct border-radius.

### Level 3 — Chat input bar
- Paperclip icon (left): `imgPaperclip1` asset, `28×28px`
- Vertical divider line: `imgLine33` asset, `1px wide, 26px tall`
- `"Ask anything"` placeholder: `14px, #a0a0a0, SF Pro Medium`
- `<input>` or `<textarea>` for typing
- Send button (right): `imgEllipse7` circle + `imgGroup136` arrow, `45×45px`
- Pressing Enter or clicking send button calls `handleSubmit`
- Clicking a suggestion sets `inputText` and focuses the input

**Check:** Input renders correctly, Enter submits, clicking suggestion fills input.

### Level 4 — Chat messages + mock AI response
- When messages exist: replace greeting+suggestions with scrollable messages view
- User message: right-aligned blue pill
- AI message: left-aligned dark pill
- Typing indicator: `"..."` in AI bubble while waiting
- Auto-scroll to bottom after each message
- Input stays at bottom always

**Check:** Send a message, see it appear right-aligned, AI responds after 800ms with a mock answer.

### Level 5 — Polish
- Navbar tab: when on `/ai`, add an `"AI"` tab to the Navbar tab strip (active, `bg-[#b2c5f2] text-black`)
- Closing the AI tab (×) navigates to `/home` and removes the tab
- Sidebar "AI" item is highlighted (`bg-[#b2c5f2] text-black`) when on `/ai`
- Input bar stays visible even when messages are shown — always at bottom
- Smooth scroll animation on new messages

**Check:** AI tab appears in Navbar when on `/ai`. Closing the × removes the tab and goes back to home.

---

## Notes for Claude Code

1. **The gradient is mandatory** — use the exact asset URLs provided. The page looks generic without it.
2. **Suggestion pills use the same bordered box as the chat input** — the bottom section `(y=919)` is both the 3rd suggestion container AND the input bar container. They share the same border box.
3. **No backend AI integration yet** — mock responses only. The actual AI API (OpenAI/Anthropic) comes in a future phase.
4. **`firstName` comes from `/api/auth/me`** — same pattern as every other page.
5. **Navbar tab for AI** — in `Navbar.jsx`, the tab strip currently shows hardcoded document tabs. For the AI page, pass `activeTabTitle="AI"` as a prop and it renders as the active tab.
6. **Build level by level** — stop after each level and report.
7. **Do not break** any existing pages.

---

## Phase 3: Backend Integration + Fixes

### Overview

Connect the frontend to the existing Express backend. Fix model mismatches, add OTP email verification via Nodemailer, wire up all forms, and add a placeholder Home page after login.

Backend base URL: `http://localhost:3000` (or whatever port the backend runs on — check `server.js`)
All requests use `withCredentials: true` (cookie-based JWT auth).

---

### Backend Fixes Required

#### 1. User Model — remove `college_name`, add `username` + `profession`

The Figma design and beta scope do not include `college_name`. Replace with fields the Profile screen actually collects.

**File:** `src/models/user.models.js`

```js
// REMOVE: college_name (required)
// ADD:
username: { type: String, trim: true, default: "" },
profession: { type: String, trim: true, default: "" },
emailVerified: { type: Boolean, default: false },
otp: { type: String, default: null },
otpExpiresAt: { type: Date, default: null },
```

#### 2. Auth Controller — fix register to not require `college_name`

**File:** `src/controllers/auth.controller.js`

```js
// registerUser: change destructuring from:
const { name, email, password, college_name } = req.body;
// to:
const { firstName, lastName, email, password } = req.body;
const name = `${firstName} ${lastName}`.trim();

// Remove college_name from required check and model.create()
```

#### 3. Profile Model — simplify for beta

**File:** `src/models/profile.model.js`

Keep only what the Profile screen collects. Remove `tagline`, `bio`, `github`, `linkedin` for now.

```js
// Keep: profile_pic, theme
// Add: username, profession (mirror from user model for profile display)
// Remove: tagline, bio, github, linkedin (future)
// Fix typo: trime → trim on bio field
```

#### 4. Onboarding Controller — update to match new fields

**File:** `src/controllers/onboarding.controller.js`

```js
// Change destructuring to:
const { username, profession, theme = "light" } = req.body;

// Also update the user model update to save username + profession:
await userModel.findByIdAndUpdate(req.user.id, {
  username,
  profession,
  onboardingCompleted: true
});
```

#### 5. Add OTP Email Verification

Use **Nodemailer** with **Ethereal** (fake SMTP for testing — no real email account needed, shows emails in a web UI).

Install: `npm install nodemailer`

**New file:** `src/services/email.service.js`

```js
const nodemailer = require("nodemailer");

async function createTransporter() {
  // Ethereal test account — auto-creates a free test inbox
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

async function sendOTPEmail(email, otp) {
  const transporter = await createTransporter();
  const info = await transporter.sendMail({
    from: '"Vyrix" <noreply@vyrix.com>',
    to: email,
    subject: "Your Vyrix verification code",
    text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
    html: `<p>Your OTP is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  });
  // Log preview URL — open this in browser to see the email during testing
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  return info;
}

module.exports = { sendOTPEmail };
```

**New routes in:** `src/routes/onboarding.routes.js`

```js
router.post("/send-otp", authMiddleware.authUser, onboardingController.sendOTP);
router.post("/verify-otp", authMiddleware.authUser, onboardingController.verifyOTP);
```

**New controller functions in:** `src/controllers/onboarding.controller.js`

```js
async function sendOTP(req, res) {
  // Generate 6-digit OTP
  // Save hashed OTP + expiry (10 min) to user document
  // Call sendOTPEmail(user.email, otp)
  // Return success
}

async function verifyOTP(req, res) {
  // Get OTP from req.body
  // Compare with stored hash, check expiry
  // If valid: set user.emailVerified = true, clear otp fields
  // Return success → frontend navigates to /tutorials
}
```

---

### Frontend Changes Required

#### 1. Axios instance

**New file:** `src/api/axios.js`

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // send cookies with every request
});

export default api;
```

#### 2. Signup Page — wire up form

- Collect: `firstName`, `lastName`, `email`, `password`
- On submit: `POST /api/auth/register`
- On success: navigate to `/profile`
- On error: show error message below form

#### 3. Login Page — wire up form

- Collect: `email`, `password`
- On submit: `POST /api/auth/login`
- On success: navigate to `/home`
- On error: show error message

#### 4. Profile Page — wire up form + OTP

- Collect: `username`, `profession`, optional `profile_pic` (file upload)
- **"Verify your Email"** button → `POST /api/onboarding/send-otp`
  - On success: show OTP input field
  - Log Ethereal preview URL to console (backend does this automatically)
- **OTP field + "Continue"** → `POST /api/onboarding/verify-otp`
  - On success: `POST /api/onboarding/profile` with username, profession, profile_pic
  - Then navigate to `/tutorials`

#### 5. Home Page (placeholder)

**New file:** `src/pages/Home.jsx`

```jsx
// Simple placeholder
export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <h1 className="text-white font-unbounded text-4xl">
        Home Page — In Progress 🚧
      </h1>
    </div>
  );
}
```

Route: `/home`

#### 6. Update routing in App.jsx

```jsx
<Route path="/home" element={<Home />} />
```

---

### Full Onboarding Flow (end to end)

```
/signup     → POST /api/auth/register    → navigate to /profile
/login      → POST /api/auth/login       → navigate to /home
/profile    → POST /api/onboarding/send-otp  (on "Verify Email" click)
            → POST /api/onboarding/verify-otp (on "Continue" click)
            → POST /api/onboarding/profile    (on OTP verified)
            → navigate to /tutorials
/tutorials  → navigate to /tutorials/next (on "Next" click)
/tutorials/next → navigate to /home (on "Next" click)
```

---

### API Summary

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/api/auth/register` | ❌ | `firstName, lastName, email, password` | `{ success, message }` |
| POST | `/api/auth/login` | ❌ | `email, password` | `{ success, accessToken }` |
| POST | `/api/onboarding/send-otp` | ✅ cookie | — | `{ message }` |
| POST | `/api/onboarding/verify-otp` | ✅ cookie | `{ otp }` | `{ message }` |
| POST | `/api/onboarding/profile` | ✅ cookie | `multipart: username, profession, profile_pic` | `{ message, data }` |

---

### Notes for Claude Code

1. **Nodemailer Ethereal** — no `.env` keys needed for testing. `createTestAccount()` auto-generates credentials at runtime. The preview URL printed in the backend console is where you view the sent email.
2. **JWT is 15 min** — for now don't handle refresh. If user gets 403, redirect to `/login`.
3. **`withCredentials: true`** is mandatory on every Axios request — cookies won't be sent otherwise.
4. **Profile pic** is optional — if no file selected, send form without it. Backend defaults to `""`.
5. **`college_name` is removed** — update register validation to only require `firstName`, `lastName`, `email`, `password`.
6. **Fix `storage.service.js`** — it uses ES module `import` syntax but the rest of the backend uses CommonJS `require`. Change to `const ImageKit = require("@imagekit/nodejs")`.

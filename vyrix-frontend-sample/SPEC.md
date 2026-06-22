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

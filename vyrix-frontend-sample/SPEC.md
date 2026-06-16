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

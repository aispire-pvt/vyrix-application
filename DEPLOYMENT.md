# Vyrix — Deployment Guide (Fully Working Demo)

Frontend → **Vercel** · Backend → **Render** · Database → **MongoDB Atlas** (already set up)

The code is already prepared for deployment:
- Frontend API URL is env-driven (`VITE_API_URL`)
- `vercel.json` handles SPA routing (no 404 on refresh)
- Auth cookie auto-switches to `SameSite=None; Secure` in production
- `.gitignore` files prevent secrets/node_modules from being pushed
- Backend has a `start` script (`node server.js`)

---

## Step 0 — MongoDB Atlas: allow the backend host to connect
1. Go to **cloud.mongodb.com** → your cluster → **Network Access**
2. **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) → Confirm
   - (Render's server IP isn't fixed, so this is the simplest option for a demo.)

---

## Step 1 — Put the code on GitHub (two repos)
Create two empty GitHub repos, e.g. `vyrix-frontend` and `vyrix-backend`.

**Backend:**
```bash
cd vyrix-backend-sample
git init
git add .
git commit -m "Vyrix backend"
git branch -M main
git remote add origin https://github.com/<you>/vyrix-backend.git
git push -u origin main
```
**Frontend:**
```bash
cd vyrix-frontend-sample
git init
git add .
git commit -m "Vyrix frontend"
git branch -M main
git remote add origin https://github.com/<you>/vyrix-frontend.git
git push -u origin main
```
> The `.gitignore` files make sure `.env` and `node_modules` are NOT uploaded. ✅

---

## Step 2 — Deploy the BACKEND on Render
1. Go to **render.com** → **New** → **Web Service** → connect the `vyrix-backend` repo
2. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. **Environment Variables** (add each):
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | your long random secret |
   | `IMAGEKIT_PRIVATE_KEY` | your ImageKit private key |
   | `EMAIL_USER` | VanshSrivastava709@gmail.com |
   | `EMAIL_PASS` | your Gmail App Password |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | *(leave blank for now — set after Step 3)* |
4. **Create Web Service.** When live, copy the URL, e.g. `https://vyrix-backend.onrender.com`
5. Test it: open `https://vyrix-backend.onrender.com/api/auth/login` in a browser — a JSON error is fine (means it's running).

> ⚠️ Render's free tier **sleeps after ~15 min idle**; the first request then takes ~50s to wake. Normal for a demo.

---

## Step 3 — Deploy the FRONTEND on Vercel
1. Go to **vercel.com** → **Add New** → **Project** → import the `vyrix-frontend` repo
2. Vercel auto-detects **Vite** (build `npm run build`, output `dist`) — leave as is
3. **Environment Variables:**
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | your Render backend URL (e.g. `https://vyrix-backend.onrender.com`) |
4. **Deploy.** When done, copy the URL, e.g. `https://vyrix.vercel.app`

---

## Step 4 — Connect the two (CORS)
1. Back in **Render** → your backend → **Environment** → set:
   - `CLIENT_URL` = your Vercel URL (e.g. `https://vyrix.vercel.app`)  — **no trailing slash**
2. Save → Render redeploys automatically.

---

## Step 5 — Test the live demo
1. Open your Vercel URL → `/signup`
2. Sign up with a **real email**
3. On `/profile` → "Verify your Email" → check inbox for the OTP → enter it → Continue
4. Lands on `/tutorials` → `/home`

If signup/login fails on the live site, it's almost always one of:
- `VITE_API_URL` not set (or wrong) on Vercel → frontend still calling localhost
- `CLIENT_URL` on Render doesn't exactly match the Vercel domain → CORS blocked
- `NODE_ENV` not `production` on Render → cookie not `Secure`, so it won't be stored cross-site
- Atlas Network Access not opened → backend can't reach the DB

---

## Notes
- **Rotate secrets** before going public if this repo was ever shared — the old `.env` had live credentials.
- Profile pictures upload to **ImageKit**; make sure that key is set on Render or uploads will error (the rest of onboarding still works without a picture).

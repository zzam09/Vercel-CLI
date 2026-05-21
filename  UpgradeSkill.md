# SpaceX Portal — PWA & Production Upgrade Skill

## Project Summary (what this app is)

A private members-only portal. Users log in via email OTP (one-time code).
Admin manages members via a hidden admin panel.
Emails sent via Resend. Data stored in Firebase Firestore. Auth via Supabase OTP.

**Stack:** Firebase (DB) · Supabase (auth/OTP) · Resend (email) · Vite (build) · Vercel (hosting)

---

## File Map (most important files)

```
index.html                  → redirects to /pages/login
pages/
  login.html                → step 1: email, step 2: OTP code entry
  user.html                 → member profile page (after login)
  hq-control-7x9k.html     → admin panel (secret URL, password: Sx9k@Zm#4Qp)
  email-admin.html          → email template editor
  shared.css                → CSS variables (dark/light theme)
  compose/                  → MailOps email composer (React)
  users/                    → user list (React)
js/
  auth.js                   → Supabase OTP login logic
  firebase-config.js        → Firebase init (uses VITE_ env vars)
  admin.js                  → Firestore CRUD for members
  user.js                   → loads member profile from Firestore
api/
  send.js                   → POST /api/send → Resend email
  users.js                  → GET /api/users → list Supabase users
  templates/index.js        → GET/POST email templates in Firestore
  manage-supabase-user/     → add/delete Supabase auth users
  send-welcome-email/       → sends welcome email via Resend
emails/
  welcome.jsx               → React Email welcome template
  reset-password.jsx        → React Email reset template
  theme.js                  → email color/font config
public/
  sw.js                     → Service Worker (cache shell)
  manifest.json             → PWA manifest
  404.html                  → cookie check page (AI Studio artifact)
server.js                   → Express dev server + Firebase watcher
vercel.json                 → Vercel routing config
vite.config.js              → Vite build (multi-page, env vars)
```

---

## Environment Variables (required)

Set these in Vercel dashboard → Project Settings → Environment Variables.
Also create a `.env` file locally for dev (never commit it).

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
RESEND_API_KEY
```

Supabase URL and anon key are **hardcoded** in `js/auth.js` (OK for beginner, fine for now).

---

## PWA Status & What Still Needs Work

### Already in place ✅

- `public/manifest.json` — PWA manifest exists
- `public/sw.js` — Service Worker exists (caches compose page)
- Mobile viewport meta tags on all pages
- Dark/light theme toggle

### Missing / needs fixing ⚠️

| Area | Issue | Fix |
| --- | --- | --- |
| SW scope | Only caches `/pages/compose` | Expand to cache login + user pages |
| Manifest icons | References `/favicon.svg` but file doesn’t exist | Add a real SVG favicon |
| Install prompt | No “Add to Home Screen” UI | Add simple install button |
| Offline page | No offline fallback | Add `/offline.html` |
| SW registration | Not registered on login/user pages | Add `<script>` to register SW |
| 404.html | Shows AI Studio branding (Google logo) | Replace with project branding |
| iOS meta tags | Missing apple-touch-icon | Add to all HTML heads |

---

## Upgrade Priorities (beginner-friendly order)

### Priority 1 — Make it installable (PWA basics)

1. Create `public/favicon.svg` (simple SpaceX-style icon or letter S)
2. Update `public/manifest.json` with correct icons array
3. Register SW on `login.html` and `user.html`
4. Add install banner (simple button, show only if `beforeinstallprompt` fires)

### Priority 2 — Offline & reliability

1. Update `sw.js` to cache login, user, and shared.css
2. Create `public/offline.html` — simple “You’re offline” page
3. SW fetch handler: serve offline.html when network fails

### Priority 3 — Polish & production feel

1. Fix `public/404.html` — replace AI Studio logo with project logo
2. Add `<meta name="apple-mobile-web-app-*">` to all HTML pages
3. Add loading skeleton to user.html so it doesn’t flash blank
4. Improve admin panel: add keyboard shortcut to open (e.g. Ctrl+Shift+A)

### Priority 4 — Deployment hygiene

1. Move Supabase keys to env vars (optional, not urgent)
2. Add `RESEND_FROM_EMAIL` env var support for custom sender domain
3. Test Vercel deployment with all env vars set

---

## Key Code Patterns

### How OTP login works

```
login.html → js/auth.js → supabase.auth.signInWithOtp(email)
           → user enters 6 digits
           → supabase.auth.verifyOtp(email, token)
           → saveSession(email) in localStorage
           → redirect to /pages/user.html
```

### How member data loads

```
user.html → js/user.js → checks isLoggedIn() via Supabase session
          → queries Firestore: where('email', '==', sessionEmail)
          → calls populatePage(memberData)
```

### How admin adds a member

```
hq-control-7x9k.html → js/admin.js → addDoc(Firestore 'members' collection)
                     → POST /api/manage-supabase-user {action:'add', email}
                     → server.js watches Firestore → sends welcome email
```

### CSS theme system

All pages import `pages/shared.css` which defines CSS variables:
- `--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`
- Light mode: `html.light { ... }` overrides
- Toggle stored in `localStorage` key `spacex_theme`

---

## Common Tasks & How To Do Them

### Add a new page

1. Create `pages/yourpage.html`
2. Link `shared.css`: `<link rel="stylesheet" href="shared.css">`
3. Add auth check at top of `<script>`:

    ```jsx
    import { isLoggedIn } from '../js/auth.js';
    if (!await isLoggedIn()) window.location.replace('/pages/login.html');
    ```

4. Vite auto-discovers it (glob in `vite.config.js`)

### Add a new API endpoint

1. Create `api/your-endpoint.js` with `export default async function handler(req, res) {...}`
2. Add route in `server.js`: `app.post('/api/your-endpoint', async (req, res) => {...})`
3. Add rewrite in `vercel.json` if needed

### Change email template content

Edit `emails/theme.js` — the `emails.welcome` and `emails.resetPassword` objects.
To change the FROM address, update the `from` field in `server.js` sendWelcomeEmail().

### Change admin password

In `pages/hq-control-7x9k.html`, find `Sx9k@Zm#4Qp` and replace both occurrences.

---

## Things to Avoid (beginner safety)

- ❌ Don’t delete `vercel.json` — it controls routing
- ❌ Don’t commit `.env` files to GitHub
- ❌ Don’t change Firestore rules to `allow read, write: if false` — will break everything
- ❌ Don’t remove the `VITE_` prefix from env vars used in frontend code
- ❌ Don’t add `npm run build` manually — Vercel does it automatically on deploy
- ⚠️ The admin panel has a simple password (not secure) — don’t store sensitive real data

---

## Deployment Checklist

```
[ ] All 7 env vars set in Vercel
[ ] Firestore rules published (test mode is fine for now)
[ ] Resend API key active
[ ] At least 1 member added in admin panel before testing login
[ ] Custom domain configured in Vercel (optional)
[ ] PWA: manifest + SW + favicon all present
[ ] Test on mobile browser — check "Add to Home Screen"
```

---

## Design System Reference

Colors (dark mode defaults):
- Background: `#050505`
- Surface (cards): `#0f0f0f`

- Text: `#ffffff`
- Muted: `#a1a1aa`
- Success green: `#10b981`
- Warning amber: `#f59e0b`
- Danger red: `#ef4444`
- Gold (Vanguard): `#c5a059`

Fonts: Inter (UI) · JetBrains Mono (code/monospace elements)

Border radius: cards = 20-32px · buttons = 12-14px · inputs = 10px

---

## Token-saving Notes for AI Agent

- The project has TWO vite configs (`vite.config.js` and `vite.config.ts`) — use `.js` version
- `pages/user.html` is marked as binary in docs but is a real HTML file
- `server.js` is only used in local dev — Vercel uses `api/` folder serverless functions
- `src/` folder (App.tsx etc.) is mostly unused scaffolding — ignore it
- README.md is wrong — it’s the Supabase CLI readme, not project docs
- The project title switches between “SpaceX”, “Google Help Portal”, “MailOps” — all same project
# HelloMamaBetter

> **Working name — final brand TBD.** Despite "Mama" in the name, this is **not** a maternal-health app.

A reproductive-health platform built for **university students**: private contraceptive ordering, anonymous community features, confidential consultations with licensed professionals, cycle tracking, and myth-busting content. Designed to cut through stigma — anonymous by default, opt-in everywhere personal information could be exposed.

---

## Stack

| Layer | What |
|---|---|
| **Backend** | Python 3.13 · FastAPI · SQLAlchemy 2 (async) · Alembic |
| **Database** | PostgreSQL 16 |
| **Queue / cache** | Redis · Celery |
| **Auth** | JWT (HS256) · OTP email verification · Google OAuth (backend-ready) |
| **Encryption** | Fernet (envelope encryption for PII like `full_name`) |
| **Email** | `aiosmtplib` → Mailpit locally, any SMTP provider in prod (Resend / SES / SendGrid) |
| **Payments** | Paystack (config wired, no UI yet) |
| **Frontend** | Next.js 14 (App Router) · React 18 · Tailwind CSS (Relume preset) · Dancing Script web font |
| **Infra** | Docker Compose (app · postgres · postgres-test · redis · mailpit) |

---

## Quick start

```bash
# 1. Bring up everything: API, DB, Redis, Mailpit (email catcher)
docker compose up -d --build

# 2. Run migrations
docker compose exec app alembic upgrade head

# 3. Frontend dev server (in another terminal)
cd frontend
npm install
npm run dev   # http://localhost:3000
```

Mailpit web UI at **http://localhost:8025** — OTP emails land here in dev (no real emails sent).

> **PowerShell users:** your shell has `NODE_ENV=production` globally. Run `$env:NODE_ENV='development'; npm run dev` so devDependencies install and Next stops complaining.

### What you can do once it's running

1. Visit `http://localhost:3000/signup`. Fill the form (email can be anything — `me@example.com` is fine in dev).
2. Open Mailpit at `http://localhost:8025`, copy the 6-digit OTP from the latest email.
3. Paste into `/verify-otp` → you get a token pair → redirected home, logged in. The navbar shows your avatar + menu.

---

## Architecture notes worth knowing

### Auth flow
- `POST /api/v1/auth/register` → user created (inactive, unverified) + Fernet-encrypted name + OTP emailed
- `POST /api/v1/auth/verify-otp` → marks user verified, returns access + refresh token pair
- `POST /api/v1/auth/login` → token pair if password + verified + active
- `POST /api/v1/auth/resend-otp` → re-sends `email_verify` *or* `password_reset` OTP based on `purpose`
- `POST /api/v1/auth/reset-password` → email + code + new password (one-shot, no intermediate auth state)
- `GET /api/v1/auth/me` → current user (decrypts `full_name` server-side, only returned to the user themselves)
- `GET /api/v1/auth/username-available?username=…` → public availability check for client-side feedback

### Privacy posture
- `full_name` is Fernet-encrypted on `users.full_name_encrypted`; never logged, never exposed in list/feed responses.
- `username` is the only identifier intended for any future public surface (forums, community chat, leaderboard, etc.).
- New users without a username at signup get an auto-generated one like `BraveLily042` (32 adjectives × 32 nouns × 1000 numbers, unique-checked with retries).
- Login error messages are deliberately generic to avoid email enumeration.

### Frontend layout
- `app/` — Next App Router pages. Auth pages live in `app/(auth)/` (route group with shared layout — form left, contextual showcase right).
- `home/`, `about/`, `how-it-works/`, `products/` — page-folder pattern, each `index.jsx` is re-exported by `app/<route>/page.jsx`.
- `components/` — shared UI: `Navbar`, `Footer`, `UserMenu`, `Avatar`, `AuthButton`, `PasswordField`, `PasswordRules`, `SignupShowcase`, `AuthShowcase`.
- `lib/` — `api.js` (fetch wrapper with bearer auth + custom error parser), `auth.js` (token storage), `AuthContext.jsx` (`useAuth()` hook).

### Storage
- Access + refresh tokens live in **localStorage**. Acceptable for an MVP; harden to HttpOnly cookies before public launch.
- Static assets in `frontend/public/images/`. Large hero/feature images haven't been compressed yet — see roadmap.

---

## What's next

A pragmatic working list, ordered roughly by impact:

### High-value, partially built
- [ ] **Profile / Settings / Notifications / Help pages** — `UserMenu` links to `/profile`, `/settings`, `/notifications`, `/help` but those routes 404. Scaffold them with at least a minimal "Coming soon" state so the menu doesn't dead-end.
- [ ] **Username editor** in profile/settings — backend already validates uniqueness via `PATCH` shape; need a small UI that calls `is_username_taken` debounced (same pattern as signup) and submits the change.
- [ ] **Google OAuth button** on `/login` and `/signup` — backend route `POST /auth/google` is wired, but `GOOGLE_CLIENT_ID` is empty in `.env` and no GIS SDK in the frontend yet.
- [ ] **About / How it works / Products** pages — still Relume defaults. Need real copy + photography that matches the product story.
- [ ] **Layout526 image swaps** — 4 of 6 feature cards still use Relume placeholder images. Source files exist in `images/` (`tracking.jpg`, `reading.jpg`, `package.jpeg`, `artificial-intelligence.png`).

### Domain features (DB models exist, no UI/services yet)
- [ ] **Community chat / forums** (anonymous via `username`) — this was the motivator for the username system.
- [ ] **Doctor consultations** — `ChatSession` + `ChatMessage` models present; need student↔professional chat UI, professional onboarding flow, scheduling.
- [ ] **Appointments** — model exists for student↔professional bookings; no service or UI.
- [ ] **Marketplace orders** — `Product`, `Order`, `OrderItem` models present; need browsing, cart, checkout.
- [ ] **Paystack payments** — keys configured in `.env`, but no payment-initiate or webhook handler yet. Required for the marketplace.
- [ ] **Cycle tracking** — `HealthLog` + `Reminder` models present; need logging UI, prediction logic, push/email reminders via Celery.
- [ ] **Content/articles** — `ContentArticle` model + author relationship; need a CMS-style admin area and a public reader.

### Production readiness
- [ ] **SMTP provider** for staging + prod (Resend or SES). The code is provider-agnostic — only env vars change.
- [ ] **Image optimization** — `bean-peeping.png` (1.8 MB), `kidding.png` (984 KB), `new-bean.png` (1.8 MB), `online-consultation.jpg` (1.2 MB) are uncompressed. Run through Squoosh / `sharp` before deploy.
- [ ] **`next/image`** for the hero + showcase imagery so we get responsive sizes + lazy loading for free.
- [ ] **HttpOnly-cookie auth** to replace localStorage tokens. Reduces XSS exposure.
- [ ] **CI/CD** — no pipeline yet. At minimum: pytest + frontend build on PR, Docker image push on merge to `main`.
- [ ] **Tests** — `tests/` directory exists but is mostly empty. Priorities: auth service (register/verify/login/reset), username uniqueness/generation, Fernet encryption round-trip.
- [ ] **Logging + observability** — structured logs are in place; need a destination (Sentry/Logtail/Grafana Cloud) before prod.
- [ ] **Rate limiting** on `/auth/register`, `/auth/login`, `/auth/resend-otp`, `/auth/reset-password`, `/auth/username-available`. Brute-force defense.

### Polish
- [ ] **Logged-in landing experience** — once auth works, `/` still shows the marketing hero. Add a "dashboard" view for authenticated users.
- [ ] **Mobile signup showcase** — the bean gag is desktop-only (`hidden lg:block`). Decide whether to ship a mobile variant or accept the desktop-only treatment.
- [ ] **Password-reset email template** — currently uses the email-verify template with the label swapped. Worth a dedicated template for clarity.
- [ ] **Forgot username** flow — analog of forgot password. Probably "email me my username".

---

## Project structure

```
.
├── alembic/                 # DB migrations
├── app/                     # FastAPI backend
│   ├── routers/             # HTTP routes (auth, …)
│   ├── services/            # Domain logic (no commits — routers control txn)
│   ├── schemas/             # Pydantic request/response models
│   ├── models/              # SQLAlchemy ORM
│   ├── core/                # exceptions, middleware, security
│   ├── utils/               # encryption, username generator, validators
│   ├── tasks/               # Celery jobs (placeholders)
│   ├── config.py            # pydantic-settings (reads .env)
│   └── main.py              # FastAPI app factory
├── frontend/                # Next.js 14
│   ├── app/                 # Router (incl. (auth) route group)
│   ├── home|about|…/        # Page folders re-exported from app/
│   ├── components/          # Shared UI
│   ├── lib/                 # api client, auth state
│   ├── public/images/       # Served assets
│   └── tailwind.config.js   # Uses Relume preset
├── images/                  # Source assets (uncompressed, not served)
├── tests/                   # pytest (sparse)
├── docker-compose.yml       # Local stack: app, db, db_test, redis, mailpit
├── Dockerfile               # API container
└── requirements.txt
```

---

## Environment variables

All in `.env` at the repo root. The non-obvious ones:

| Var | Local dev | Prod |
|---|---|---|
| `ENVIRONMENT` | `development` | `production` |
| `JWT_SECRET_KEY` | any 32+ random chars | secret |
| `FERNET_KEY` | a `cryptography.fernet.Fernet.generate_key()` value | rotate-aware |
| `SMTP_HOST` | `mailpit` (overridden in docker-compose) | `smtp.resend.com` etc. |
| `SMTP_STARTTLS` | `false` | `true` |
| `GOOGLE_CLIENT_ID` | empty (Google button hidden) | real client ID |
| `PAYSTACK_*` | empty | real keys + webhook secret |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | comma-separated prod origins |

For the frontend, `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

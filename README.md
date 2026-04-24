# MokshPath Academia — React + TypeScript

The original marketing site (HTML + CSS + vanilla JS) converted into a modular
React + TypeScript app with Tailwind CSS, React Router, protected routes, and a
centralized Axios API service.

## Stack

- **React 18** + **TypeScript**
- **Vite** for dev server / build
- **Tailwind CSS** (utility layer) alongside the preserved original stylesheet
- **React Router 6** with protected and guest routes
- **Axios** with request/response interceptors

## Getting started

```bash
npm install
cp .env.example .env     # then edit VITE_API_BASE_URL
npm run dev              # http://localhost:5173
```

Other scripts:

```bash
npm run build            # production build to ./dist
npm run preview          # preview the production build
npm run type-check       # tsc --noEmit
```

## Project structure

```
src/
├── app/                    # App root (composes routes)
│   └── App.tsx
├── components/
│   ├── common/             # Shared UI primitives (Brand, Button)
│   └── layout/             # Header, Footer, AuthFooter, LandingLayout, AuthLayout
├── context/
│   └── AuthContext.tsx     # Global auth state
├── features/               # Feature-based modules (one folder per domain)
│   ├── home/
│   │   ├── HomePage.tsx
│   │   └── components/     # Hero, Pricing, FAQ, PersonaExplorer, …
│   ├── auth/
│   │   ├── SigninPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── components/     # Shared auth UI + wizard/ (4 step components)
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   └── misc/
│       └── NotFoundPage.tsx
├── hooks/
│   └── useAuth.ts
├── routes/
│   ├── AppRoutes.tsx       # Route config as data
│   ├── ProtectedRoute.tsx  # Requires authentication
│   └── GuestRoute.tsx      # Redirects authenticated users away from auth pages
├── services/               # ── Centralized API layer ──
│   ├── apiClient.ts        # Axios instance, interceptors, token storage
│   ├── authService.ts      # requestOtp, verifyOtp, register, me, logout, googleSsoUrl
│   ├── diagnosticService.ts
│   └── index.ts
├── styles/
│   ├── globals.css         # Tailwind directives + imports legacy.css
│   └── legacy.css          # Original MokshPath stylesheet (preserved verbatim)
├── types/
│   └── index.ts
├── main.tsx
└── vite-env.d.ts
```

## Architecture notes

### Styling: hybrid approach

The original design is ~2,300 lines of highly custom CSS with orbit
animations, mandala overlays, Sanskrit typography, and bespoke component
classes. It is preserved **verbatim** in `src/styles/legacy.css` to guarantee
pixel-perfect fidelity of design and animations.

Tailwind is configured and available for new work — its theme mirrors the
original CSS variables (`saffron`, `indigo`, `cream`, etc.), so utility
classes compose cleanly with the legacy stylesheet.

### Centralized API service

No component imports `axios` directly. All network calls flow through
`src/services/apiClient.ts`, which:

- Reads `VITE_API_BASE_URL` from env
- Injects `Authorization: Bearer <token>` via a request interceptor
- Handles `401` responses by clearing the token and redirecting to `/signin`
- Exposes typed helpers (`authService`, `diagnosticService`) that return
  typed payloads defined in `src/types/index.ts`

Adding a new API: create a file under `services/`, use `apiClient`, export a
service object, re-export from `services/index.ts`.

### Routing

Routes are declared as data in `src/routes/AppRoutes.tsx`. Public, guest-only
(`/signin`, `/register`), and protected (`/dashboard`) routes are
differentiated by wrapping the element in `GuestRoute` or `ProtectedRoute`.
`ProtectedRoute` shows a loading state while auth bootstraps, then
redirects unauthenticated users to `/signin` preserving the original
destination in `location.state.from`.

### Auth lifecycle

`AuthContext` owns `user`, `token`, and `isLoading`. On mount, if a token is
present in `localStorage`, it calls `authService.me()` to hydrate the user.
After `register` → `verifyOtp` or `signin` → `verifyOtp`, components call
`loginWithAuthResponse(res)` which persists the token and updates state.

### JS behaviors ported from the original

- Persona tab switching + `#tab-parent`/`#tab-student`/etc. deep-linking →
  `features/home/components/PersonaExplorer.tsx`
- Mobile nav hamburger toggle → `components/layout/Header.tsx`
- Email/phone method toggle on signin + wizard step 3 →
  `features/auth/components/ContactMethodToggle.tsx`
- 4-step wizard navigation with progress dots, persona-dependent fields →
  `features/auth/RegisterPage.tsx` + `components/wizard/*`
- OTP 6-box auto-advance + backspace-back →
  `features/auth/components/wizard/StepVerify.tsx`

## Placeholder assets

`public/assets/` contains simple SVG placeholders for `logogod.svg`,
`mandala.svg`, `Guru.jpeg`, and the four `dash-*.svg` dashboard mockups.
Replace with the production artwork when available; filenames and paths are
unchanged from the original HTML.

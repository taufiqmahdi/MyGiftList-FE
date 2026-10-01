# MyGiftList — Frontend

A gift registry web application built with **Next.js 15** (App Router) and **TypeScript**. Users can create and manage gift registries for any occasion, share a public link with guests, and track which gifts have been booked — all without requiring guests to register.

> **Demo branch.** This version runs without the Laravel backend. `lib/api.ts` is served by an in-browser store (`lib/demo/`) seeded with a sample account, three registries, items and bookings, and saved in `localStorage`. Log in with **any well-formed email and any password**. Each visitor gets their own sandbox, which they can restore with the **Reset demo data** button in the banner. Booking confirmations show the cancellation link directly, since no emails are sent.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | CSS Modules + global CSS variables |
| State | React `useState` / `useEffect` (no external library) |
| Auth state | React Context (`AuthContext`) |
| Notifications | React Context (`ToastContext`) |
| HTTP | Native `fetch` via a typed `api.ts` helper |
| Fonts | Cormorant Garamond (display) · DM Sans (body) via Google Fonts |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx   # Reads ?token=&email= from URL
│   ├── dashboard/
│   │   ├── page.tsx              # Registry list (protected)
│   │   └── registries/[id]/
│   │       └── page.tsx          # Registry detail + item management (protected)
│   ├── r/[slug]/
│   │   └── page.tsx              # Public registry view (no auth required)
│   └── bookings/cancel/[uuid]/
│       └── page.tsx              # Booking cancellation (no auth required)
├── components/
│   ├── Navbar.tsx                # Sticky nav, auth-aware
│   ├── Footer.tsx
│   └── ui/
│       └── Modal.tsx             # Reusable modal (ESC + click-outside to close)
├── contexts/
│   ├── AuthContext.tsx           # Token storage, user state, login/logout
│   └── ToastContext.tsx          # Global toast notifications
├── lib/
│   └── api.ts                    # All API calls, typed
└── middleware.ts                 # Route protection + auth redirects
```

---

## Pages & Features

### Landing (`/`)
Marketing page with hero section, feature highlights, and how-it-works steps. Links to register and log in.

### Authentication
| Route | Description |
|---|---|
| `/register` | Create account — name, username, email, phone, password |
| `/login` | Email + password login |
| `/forgot-password` | Sends a reset link to the provided email |
| `/reset-password` | Reads `?token=` and `?email=` from the URL (set by the backend email link) |

Auth tokens are stored in `localStorage` and mirrored to a `mgl_token` cookie so Next.js middleware can protect routes server-side.

### Dashboard (`/dashboard`) — *protected*
Lists all registries belonging to the logged-in user as cards. Each card shows the event type, date, public/private status, and quick actions.

- **Create registry** — modal form with title, auto-generated URL slug (editable), event type, event date, description, and a public/private toggle.
- **Edit registry** — same modal, pre-filled.
- **Delete registry** — confirmation modal before deletion.
- **Copy share link** — copies the public `/r/[slug]` URL to clipboard.

### Registry Detail (`/dashboard/registries/[id]`) — *protected*
Manages the items inside a single registry.

- Displays registry title, event info, item count, and booked ratio.
- **Add item** — modal form with name, description, price (IDR), quantity, priority (Low / Medium / High), product URL, and image URL.
- **Edit item** — same modal, pre-filled; image reloads immediately after save.
- **Delete item** — confirmation modal.
- **Toggle purchased** — optimistic UI update; marks an item as purchased by the registry owner (hides it from the "Available" section on the public page).
- **Share link** / **Preview** — copy the public URL or open it in a new tab.

### Public Registry (`/r/[slug]`) — *no auth required*
The shareable page sent to guests. No login needed to view or book.

- Shows registry title, event type, date, and description.
- Items are split into **Available gifts** and **Already claimed** sections.
  - Items marked as purchased by the owner are excluded from Available.
  - Items fully booked by guests are moved to Already claimed.
- **Book this gift** — opens a modal asking for the guest's name, email, quantity, and an optional note. On success, displays the **cancellation ID** the guest can use later.

### Booking Cancellation (`/bookings/cancel/[uuid]`) — *no auth required*
A standalone page guests can visit to cancel a booking they made. Shows the booking reference UUID and asks for confirmation before calling the cancel API.

---

## API Communication

All requests go through `src/lib/api.ts`, which wraps `fetch` with:
- Automatic `Authorization: Bearer <token>` injection from `localStorage`
- `Content-Type: application/json` and `Accept: application/json` headers
- Error throwing for non-2xx responses (caught per-call in the pages)

Laravel API Resources wrap responses in `{ data: { ... } }`. Every page uses a local `unwrap()` helper to extract the payload before reading any fields:

```ts
function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in (res as object)) {
    return (res as { data: T }).data;
  }
  return res as T;
}
```

---

## Auth Flow

1. On login or register, the server returns an `access_token`.
2. `AuthContext.hydrateFromResponse()` stores the token in both `localStorage` (for API calls) and a cookie named `mgl_token` (for middleware).
3. On every page load, if `localStorage` has a token, `GET /api/v1/auth/me` is called to restore the user session.
4. On logout, both stores are cleared.

**Middleware** (`src/middleware.ts`) reads the `mgl_token` cookie and:
- Redirects unauthenticated users away from `/dashboard/*` → `/login`
- Redirects authenticated users away from `/login`, `/register`, etc. → `/dashboard`

---

## Getting Started

### Prerequisites
- Node.js 18+
- A running instance of the MyGiftList Laravel backend

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

The app runs at `http://localhost:3000`.

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Laravel backend | `http://localhost:8000` |

---

## Route Protection Summary

| Route | Auth required | Notes |
|---|---|---|
| `/` | No | Landing page |
| `/login` | No (redirects if authed) | |
| `/register` | No (redirects if authed) | |
| `/forgot-password` | No | |
| `/reset-password` | No | Needs `?token=` and `?email=` params |
| `/dashboard` | **Yes** | Redirects to `/login` if no token |
| `/dashboard/registries/[id]` | **Yes** | |
| `/r/[slug]` | No | Public registry page |
| `/bookings/cancel/[uuid]` | No | Guest cancellation page |
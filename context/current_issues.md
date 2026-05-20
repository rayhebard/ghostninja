When I click the signout button I am taken to page which does says rendering at the bottom and never completes

This also happens sometimes when I log

---

### Resolution

**Root cause:** `ClerkProvider` was missing explicit redirect URLs. After sign-out, Clerk defaulted to navigating to the current page (`/editor` — a protected route). The middleware then triggered `auth.protect()` → redirect to `/sign-in`, creating a race condition between Clerk's client-side navigation and the server middleware, causing the infinite "Rendering..." state. The same race occurred during sign-in callbacks.

**Fix (app/layout.tsx):**
- Added `signInUrl="/sign-in"` — Clerk knows exactly where the sign-in page lives
- Added `signUpUrl="/sign-up"` — same for sign-up
- Added `signInFallbackRedirectUrl="/editor"` — redirect to editor after login when no `redirect_url` param exists
- Added `afterSignOutUrl="/sign-in"` — redirect to sign-in after logout, avoiding the protected-route race

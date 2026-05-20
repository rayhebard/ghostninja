When I click the sign-out button I am taken to a page that displays 'rendering' at the bottom and never finishes loading

This also sometimes happens when I log in

---

### Resolution

**Root cause:** `ClerkProvider` was missing explicit redirect URLs. After sign-out, Clerk defaulted to navigating to the current page (`/editor` — a protected route). The middleware then triggered `auth.protect()` → redirect to `/sign-in`, creating a race condition between Clerk's client-side navigation and the server middleware, causing the infinite "Rendering..." state. The same race occurred during sign-in callbacks.

**Fix (app/layout.tsx):**
- Added `signInUrl="/sign-in"` — Clerk knows exactly where the sign-in page lives
- Added `signUpUrl="/sign-up"` — same for sign-up
- Added `signInFallbackRedirectUrl="/editor"` — redirect to editor after login when no `redirect_url` param exists
- Added `afterSignOutUrl="/sign-in"` — redirect to sign-in after logout, avoiding the protected-route race

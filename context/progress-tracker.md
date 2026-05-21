# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Share dialog wired to real API

## Current Goal

- Collaborative canvas (Liveblocks + React Flow)

## Completed

(all previous items plus:)

- Created `lib/utils.ts` with `cn()` helper using clsx + tailwind-merge
- Installed `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`
- Installed and configured shadcn/ui via CLI
- Added 7 shadcn components: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea
- Set up dark theme in `globals.css` with Tailwind v4 `@theme inline` block
  - Project semantic tokens: `base`, `surface`, `elevated`, `subtle`, `border-default`, `border-subtle`, `copy-primary`, `copy-secondary`, `copy-muted`, `copy-faint`, `brand`, `brand-dim`, `ai`, `ai-text`, `state-error`, `state-success`, `state-warning`
  - shadcn compatibility layer mapping tokens to `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`
  - Border radius scale: `rounded-xl` (0.75rem), `rounded-2xl` (1rem), `rounded-3xl` (1.5rem)
- Fixed dark mode not rendering: added `bg-background text-foreground` to `<body>` in layout, set `color-scheme: dark` in CSS
- Created `components/editor/editor-navbar.tsx` — fixed height top navbar with left (sidebar toggle via `PanelLeftOpen`/`PanelLeftClose`), center, and right sections, dark background, subtle bottom border, accepts `isSidebarOpen` + `onToggleSidebar` props
- Created `components/editor/project-sidebar.tsx` — floating left sidebar (no content push) with "Projects" header + close button, shadcn Tabs (My Projects / Shared) with empty placeholders, and full-width "New Project" button with Plus icon
- Created `app/editor/layout.tsx` — editor layout managing sidebar state, renders navbar + floating sidebar + page content
- Created `app/editor/page.tsx` — placeholder editor page with centered message
- Installed `@clerk/ui` for bundled Clerk UI and theme system
- Created `proxy.ts` at root — protected-first middleware via `clerkMiddleware`, public routes: `/`, `/sign-in(.*)`, `/sign-up(.*)`
- Updated `app/layout.tsx` — `ClerkProvider` uses Clerk's `dark` theme from `@clerk/ui/themes`, bundled `ui` from `@clerk/ui`, and `variables` mapping our CSS tokens (no hardcoded colors)
- Updated `app/sign-in/[[...sign-in]]/page.tsx` — two-panel layout: left panel with logo/tagline/feature list (responsive), right panel with centered Clerk `<SignIn>`
- Updated `app/sign-up/[[...sign-up]]/page.tsx` — same two-panel layout with `<SignUp>`
- Updated `app/page.tsx` — server component using `auth()` from `@clerk/nextjs/server`: authenticated users redirect to `/editor`, unauthenticated redirect to `/sign-in`
- `UserButton` already present in `editor-navbar.tsx` — no changes needed
- Created `hooks/use-project-dialog.tsx` — shared hook + context for dialog state, form state, mock data, `toSlug()` utility
- Created `components/editor/editor-home.tsx` — editor home screen with heading, description, "New Project" button
- Created `components/editor/create-project-dialog.tsx` — project name input with live slug preview
- Created `components/editor/rename-project-dialog.tsx` — prefilled name, auto-focus, Enter submits
- Created `components/editor/delete-project-dialog.tsx` — destructive confirmation, no input
- Updated `components/editor/project-sidebar.tsx` — project items with rename/delete action menu (owned only), mobile backdrop scrim
- Updated `app/editor/layout.tsx` — wraps content in `ProjectDialogProvider`, renders all three dialogs
- Updated `app/editor/page.tsx` — renders `EditorHome` (no longer a placeholder)
- Created `prisma/models/project.prisma` — `Project` model (ownerId, name, description, status enum, canvasJsonPath, timestamps, indexes on ownerId/createdAt) and `ProjectCollaborator` model (project relation with cascade delete, email, unique constraint, indexes on email/projectId+createdAt)
- Updated `prisma/schema.prisma` — references project models via `/// <reference path="./models/project.prisma" />`
- Created `lib/prisma.ts` — cached singleton that branches on `DATABASE_URL`: uses Accelerate (`accelerateUrl`) for `prisma+postgres://`, `@prisma/adapter-pg` (with `connectionString`) otherwise; cached on `globalThis` in development
- Ran initial migration `20260520121103_init` — creates `Project` and `ProjectCollaborator` tables
- Created `app/api/projects/route.ts` — `GET` (list owned projects, desc by createdAt), `POST` (create with name defaulting to "Untitled Project", returns 201), `PATCH` (rename with owner check, returns 403 for non-owner), `DELETE` (delete with owner check, returns 403 for non-owner); all routes return 401 for unauthenticated, 400 for missing fields, 404 for not found
- Rewired `hooks/use-project-dialog.tsx` — removed mock data, replaced with `fetchProjects()` (GET), `apiCreateProject()` (POST), `apiRenameProject()` (PATCH), `apiDeleteProject()` (DELETE); projects fetched on mount via `useEffect`; mutations update local state immediately
- Updated `components/editor/project-sidebar.tsx` — replaced `mockProjects`/`mockSharedProjects` with `projects`/`sharedProjects` from context, added loading state
- Updated `app/editor/layout.tsx` — dialog `onSubmit` handlers now call `dialog.createProject`, `dialog.renameProject`, `dialog.deleteProject` (API-backed) instead of `dialog.close`
- Updated `context/progress-tracker.md` — note about mock data removed
- Created `app/api/projects/[id]/route.ts` — `PATCH` (rename, path-param ID, owner check, returns 403 for non-owner) and `DELETE` (path-param ID, owner check, returns 403 for non-owner)
- Updated `app/editor/layout.tsx` — now a server component, fetches owned projects via Prisma; fetches shared projects via `currentUser()` email + `ProjectCollaborator`; passes both serialized lists to `EditorClientLayout`
- Created `app/editor/editor-client-layout.tsx` — client component extracted from former layout, accepts `initialProjects` and `initialSharedProjects` props
- Updated `hooks/use-project-dialog.tsx` — accepts `initialProjects` + `initialSharedProjects` arrays to skip client-side fetch for initial load; uses `[id]` path routes for PATCH/DELETE; navigates to `/editor/[id]` on create; uses `useRouter` and `usePathname` from `next/navigation`
- Updated `components/editor/create-project-dialog.tsx` — preview now shows "Room ID" combining slug + 4-char random suffix instead of "URL slug"
- Updated `hooks/use-project-dialog.tsx` — `deleteProject` redirects to `/editor` if `pathname` matches the deleted project's workspace, otherwise calls `router.refresh()`
- Updated `hooks/use-project-dialog.tsx` — `renameProject` calls `router.refresh()` after success per spec
- Created `lib/project-access.ts` — `getProjectAccess(roomId)` helper using `auth()` + `currentUser()` + Prisma for owner/collaborator checks
- Created `components/editor/access-denied.tsx` — centered layout with lock icon, message, and "Back to projects" link
- Created `components/editor/workspace-navbar.tsx` — workspace top bar with project name, share button (placeholder), and AI sidebar toggle
- Created `components/editor/workspace-shell.tsx` — full-viewport workspace layout: workspace navbar, dark canvas placeholder, collapsible AI sidebar placeholder
- Created `app/editor/[roomId]/page.tsx` — server component: redirects unauthenticated to sign-in, shows `AccessDenied` for missing/unauthorized projects, renders `WorkspaceShell` with project context
- Updated `app/editor/editor-client-layout.tsx` — detects workspace pages via `usePathname()`, skips `EditorNavbar` and removes `pt-12` padding for workspace routes; merges `sidebarOpen`/`toggleSidebar` into dialog context
- Updated `components/editor/project-sidebar.tsx` — `ProjectItem` uses `Link` to navigate to `/editor/[id]`, highlights active project via `usePathname()`, accepts `id` and `active` props; reads `sidebarOpen` from context instead of props
- Updated `hooks/use-project-dialog.tsx` — added `sidebarOpen: boolean` and `toggleSidebar: () => void` to context interface
- Updated `components/editor/editor-navbar.tsx` — reads `sidebarOpen`/`toggleSidebar` from context instead of props
- Updated `components/editor/workspace-navbar.tsx` — added sidebar toggle button using `PanelLeftOpen`/`PanelLeftClose` from context
- Created `app/api/projects/[id]/collaborators/route.ts` — `GET` (list enriched collaborators with Clerk avatars/names), `POST` (invite by email, owner-only), `DELETE` (remove by email query param, owner-only); ownership enforced server-side
- Created `components/editor/share-dialog.tsx` — share dialog with copy-link + "Copied!" feedback, collaborator list with Clerk avatars/names (email fallback), invite input for owners, remove button on hover for owners; collaborators see read-only list
- Updated `components/editor/workspace-navbar.tsx` — added `onShare` prop, wired share button
- Updated `components/editor/workspace-shell.tsx` — manages share dialog state, renders `ShareDialog`, passes `onShare` to navbar
- Updated `app/editor/[roomId]/page.tsx` — passes `isOwner` to `WorkspaceShell`

## Notes

- Dialog pattern: existing shadcn `Dialog` component uses color tokens from `globals.css` and supports title, description, and footer actions — ready for future use per spec.
- `proxy.ts` replaces `middleware.ts` (Next.js 16 convention). Uses protected-first strategy: blocks everything except `/`, `/sign-in/*`, `/sign-up/*`.
- Catch-all routes `[[...sign-in]]` / `[[...sign-up]]` auto-generated by Clerk SDK are used to cover all Clerk auth sub-paths (password reset, etc.).
- Clerk appearance `variables` use the same hex values from `globals.css` project tokens to avoid hardcoded colors.
- Project dialogs now backed by API — create, rename, delete hit `/api/projects` endpoints with optimistic local state updates. Rename/delete use `[id]` path parameter routes.
- `ProjectDialogProvider` context pattern used so editor home (page) and sidebar can both trigger dialogs rendered in the layout.

## Architecture Decisions

- Tailwind v4 `@theme inline` used for all color tokens — no separate `:root` block needed since Tailwind v4 generates CSS custom properties from `@theme`
- shadcn component tokens (`--color-background`, `--color-foreground`, etc.) reference project semantic tokens for single-source-of-truth
- Auth route protection via `proxy.ts` (Next.js 16 Proxy convention) instead of `middleware.ts`
- Clerk `dark` theme from `@clerk/ui/themes` as base appearance, overridden via `variables` using project CSS token values
- Prisma client singleton branches on `DATABASE_URL` prefix: `prisma+postgres://` uses Accelerate (`accelerateUrl`), otherwise uses `@prisma/adapter-pg` with direct `connectionString`
- Models split into separate file under `prisma/models/` and referenced via `/// <reference>` directive

## Session Notes

- Next.js 16 note: `priority` prop on `next/image` is deprecated in favor of `preload`
- Generated `components/ui/*` files are not modified per spec instructions

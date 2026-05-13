# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Editor chrome — navbar, project sidebar, and base layout

## Current Goal

- Build the editor base chrome: navbar, floating project sidebar, and route layout

## Completed

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

## In Progress

- None yet.

## Next Up

- Auth integration (Clerk)
- Project CRUD and routing
- Collaborative canvas (Liveblocks + React Flow)

## Open Questions

- None yet.

## Notes

- Dialog pattern: existing shadcn `Dialog` component uses color tokens from `globals.css` and supports title, description, and footer actions — ready for future use per spec.

## Architecture Decisions

- Tailwind v4 `@theme inline` used for all color tokens — no separate `:root` block needed since Tailwind v4 generates CSS custom properties from `@theme`
- shadcn component tokens (`--color-background`, `--color-foreground`, etc.) reference project semantic tokens for single-source-of-truth

## Session Notes

- Next.js 16 note: `priority` prop on `next/image` is deprecated in favor of `preload`
- Generated `components/ui/*` files are not modified per spec instructions

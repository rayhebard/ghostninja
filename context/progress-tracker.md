# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Canvas autosave with Vercel Blob (spec 21 complete)

## Current Goal

- Persist canvas state between sessions using Vercel Blob + Prisma

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
- Updated `liveblocks.config.ts` — defines `Presence` (cursor, isThinking) and `UserMeta` (id, name, avatar, color) types
- Created `lib/liveblocks.ts` — Liveblocks REST API helpers (`ensureRoomExists`, `authorizeUser`) using secret key; deterministic `getUserColor()` helper with 20-color palette
- Created `app/api/liveblocks-auth/route.ts` — `POST` handler that authenticates via Clerk, verifies project access via `getProjectAccess()`, ensures Liveblocks room exists (idempotent), and returns a signed token with user metadata (name, avatar, cursor color); returns 401/403/400/500 as appropriate
- Added `LIVEBLOCKS_SECRET_KEY` to `.env.local`
- Created `types/canvas.ts` — shared canvas types: `CanvasNodeData` (label, color, shape), `CanvasNode` (canvasNode type), `CanvasEdge` (canvasEdge type) with index signature for Record compatibility
- Created `components/editor/canvas.tsx` — client canvas wrapper: `LiveblocksProvider` (authEndpoint), `RoomProvider` (room ID, initial presence with cursor:null), `ClientSideSuspense` with loading state, React error boundary for connection failures; uses `useLiveblocksFlow` with suspense, renders `ReactFlow` with `isValidConnection` (loose), `fitView`, dot-pattern `Background`, and `MiniMap`
- Updated `components/editor/workspace-shell.tsx` — replaced canvas placeholder with `<Canvas roomId={projectId} />`
- Updated `types/canvas.ts` — exported `CanvasShape` union (rectangle, diamond, circle, pill, cylinder, hexagon) for use in shape panel
- Created `components/editor/shape-panel.tsx` — floating pill-shaped toolbar at canvas bottom-center with 6 draggable shape icon buttons (Square/Diamond/Circle/Pill/Cylinder/Hexagon from lucide-react); drag payload set as `application/x-canvas-shape` custom MIME with shape name, width, and height; exports `getShapePayload()` helper for drop handling
- Updated `components/editor/canvas.tsx` — added `CanvasNode` component (bordered rectangle with centered label, target/source Handles), registered `nodeTypes` on ReactFlow; added `onDrop` handler that reads shape payload, converts screen coords via `screenToFlowPosition`, creates node with `shapeName-timestamp-counter` ID, empty label, brand color, and default dimensions; added `onDragOver` handler; renders `<ShapePanel />` overlaid on the canvas
- Replaced clip-path based diamond, hexagon, and cylinder node renderers with inline SVG shapes (diamond/hexagon use `<polygon>`, cylinder uses `<rect>` + `<ellipse>` + `<line>`); rectangle, circle, and pill remain CSS-based
- Added selected state to all node components — border/stroke switches to `var(--color-brand)` when `selected` prop is true (subtle `var(--color-copy-secondary)` at rest)
- Added drag ghost preview to `shape-panel.tsx` — `createDragGhost()` generates a ghost element for each shape type (CSS inline styles for rectangle/circle/pill, inline SVG for diamond/hexagon/cylinder), registered via `setDragImage` with center offset, cleaned up on `requestAnimationFrame`
- Fixed node connection bug — three issues prevented edges from being created between nodes:
  1. `liveblocks.config.ts` had `Storage: {}` — `useLiveblocksFlow` stores flow data under `"flow"` but the type declared no storage keys. Added `import { LiveblocksFlow } from "@liveblocks/react-flow"` and typed `Storage: { flow: LiveblocksFlow }`.
  2. `RoomProvider` lacked `initialStorage` prop (now required by Liveblocks types when Storage is non-empty). Added `initialStorage` with empty `LiveObject`/`LiveMap` for the flow key.
  3. SVG overlays in DiamondNode, CylinderNode, HexagonNode blocked pointer events on Handle components — added `pointerEvents: "none"` to each SVG.
  4. Missing `@liveblocks/react-flow/styles.css` import and `<Cursors />` component added to canvas.tsx per Liveblocks React Flow setup guide.
- Added resizing to all canvas nodes — `<NodeResizer>` from `@xyflow/react` renders subtle `var(--color-copy-muted)` resize handles on selected nodes (all six shapes), with `minWidth={60}`, `minHeight={40}`, and `lineClassName="!border-copy-muted"`.
  - Added `position: relative` to RectangleNode, CircleNode, PillNode for correct handle positioning
  - Dimension changes flow through React Flow's controlled state → `onNodesChange` → Liveblocks storage
- Added inline label editing via `EditableLabel` component:
  - `<textarea>` positioned `!absolute !inset-0` over the label area to avoid layout shifts
  - double-click label to edit; placeholder "Label" in `text-copy-faint` when empty
  - Escape cancels; blur saves
  - `nodrag nowheel` on textarea prevents canvas drag/pan interference
  - `NodeEditContext` provides `updateNodeLabel(id, label)` from `FlowCanvas` — uses `reactFlow.getNode()` + `onNodesChange([{ type: "replace", ... }])` so all label changes sync to Liveblocks through the controlled flow
- Added node color toolbar (spec 15):
  - Added `NODE_COLORS` constant in `types/canvas.ts` with 8 color pairs (fill + text) from `ui-context.md`
  - Added `textColor: string` to `CanvasNodeData` interface
  - Added `ColorToolbar` component — floating bar positioned above the selected node using the React Flow viewport transform
  - Color swatches have hover glow (`box-shadow` in the swatch's text color) and active outline indicator
  - Toolbar has `nodrag nowheel` to prevent canvas drag/pan interference
  - Swatch click calls `updateNodeColor(id, fill, textColor)` which goes through `onNodesChange` → Liveblocks
  - All 6 node components now use `data.color` as background/fill and `data.textColor` as text color (SVG nodes: fill replaces `var(--color-surface)`, CSS nodes: `backgroundColor` replaces `bg-surface`)
  - New dropped nodes default to neutral pair (`#1F1F1F` / `#EDEDED`)
  - EditableLabel textarea inherits text color from parent via `color: inherit`
  - Cast `as CanvasNodeData` on spread+override to work around TypeScript index signature restriction
- Added edge behaviors and labels (spec 16):
  - Added `CanvasEdgeData` interface with `label?: string` to `types/canvas.ts`
  - Added Left/Right connection handles to all 6 node components (Top/Bottom/Left/Right) — small white dots with dark border, hidden by default, fade in on node hover via `opacity: 0 → 1` CSS transition
  - Created `CanvasEdgeComponent` — custom edge renderer using `getSmoothStepPath` for right-angle routing, `BaseEdge` with `interactionWidth={20}` for easier clicking, dimmed at rest (`var(--color-copy-muted)`), brand-colored on hover/select (`var(--color-brand)`)
  - Added inline SVG arrowhead markers in `<defs>` (dimmed/brand variants) referenced via `markerEnd`
  - Added edge label editing via `EdgeLabelRenderer` positioned at path midpoint from `getSmoothStepPath`:
    - Double-click edge to edit; uses growing `<input>` (via `size` attribute)
    - Save on blur/Enter, cancel on Escape
    - Saved labels shown as small pill badges; faint "Label" hint when selected and empty
    - `nodrag nowheel` + `stopPropagation` prevents canvas drag/pan
    - `updateEdgeLabel` goes through `onEdgesChange` → Liveblocks
  - New connections default to `type: "canvasEdge"` via `defaultEdgeOptions`
  - Registered `edgeTypes` on `<ReactFlow>`; cast `as any` for edge replace in `onEdgesChange` workaround
- Added canvas ergonomics — control bar + keyboard shortcuts (spec 17):
  - Created `hooks/use-keyboard-shortcuts.ts` — listens on `window`, ignores shortcuts when focus is in INPUT/TEXTAREA/contentEditable
  - Shortcuts: `+`/`=` zoom in, `-` zoom out, `Cmd+Z` undo, `Cmd+Shift+Z`/`Cmd+Y` redo
  - Added pill-shaped control bar at `bottom-left` via React Flow `<Panel>` with two groups separated by a thin divider
  - Zoom group: zoom out, fit view (via `reactFlow.fitView({ duration: 200 })`), zoom in — all with animated transitions
  - History group: undo/redo wired to Liveblocks `useHistory()` — disabled state dimmed when `canUndo`/`canRedo` is false
  - Icons from lucide-react: ZoomOut, Maximize, ZoomIn, Undo, Redo
  - Control bar sits above the shape panel at bottom-left, styled consistently with the shape panel (rounded-full, surface bg, border)
- Added starter templates (spec 18):
  - Created `components/editor/starter-templates.ts` — `CanvasTemplate` type, helper functions (`getTemplateBounds`, `n`, `e`), and `CANVAS_TEMPLATES` array with 3 templates (Microservices System, CI/CD Pipeline, Event-Driven System) using shared canvas types
  - Created `components/editor/starter-template-modal.tsx` — shadcn `Dialog` with scrollable grid of template cards, each containing a lightweight SVG preview (drawn from node positions/shapes without React Flow), name, description, and Import button
  - Added `LayoutTemplate` button to `WorkspaceNavbar` to open the modal
  - `WorkspaceShell` manages modal state plus an `importTemplate` registration pattern: `Canvas`/`FlowCanvas` registers an `importTemplate` function prop-drilled via `onRegisterImportTemplate` → `onRegister` → `FlowCanvas` `useEffect`
  - Import flow: removes all existing nodes/edges via `onNodesChange`/`onEdgesChange` remove changes, adds template nodes/edges via add changes, then `fitView` on next animation frame
- Added presence avatars and live cursors (spec 19):
  - Presence types (`cursor: {x,y} | null`, `isThinking: boolean`) already defined in `liveblocks.config.ts`
  - Created `components/editor/collaborator-avatars.tsx` — uses `useOthers()` from Liveblocks and `useUser()` from Clerk to show other participants in an overlapping avatar stack; excludes current user; shows up to 5 avatars with +N overflow pill; falls back to initials when no profile photo; subtle `border-base` ring for readability on dark canvas
  - Wired cursor broadcasting in `FlowCanvas` — `useUpdateMyPresence()` broadcasts cursor on `onMouseMove` (throttled via `requestAnimationFrame`), clears to `null` on `onMouseLeave`; coordinates converted via `reactFlow.screenToFlowPosition()`
  - Added presence group via React Flow `<Panel position="top-right">` inside the canvas — collaborator avatars + vertical divider (only when collaborators exist) + Clerk `UserButton` for the current user
  - Existing `<Cursors />` from `@liveblocks/react-flow` already renders live cursor pointers for other participants at the correct flow positions
- Removed all `as any` and `as CanvasNodeData` casts from `canvas.tsx` — properly typed `useReactFlow<CanvasNode, CanvasEdge>()` and `useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true })` so all React Flow mutation handlers (`onDelete`, `onNodesChange`, `onEdgesChange`) pass correctly typed payloads
- Created `components/editor/ai-sidebar.tsx` — standalone AI sidebar component extracted from `workspace-shell.tsx` placeholder:
  - Header with bot icon, "AI Workspace" title, "Collaborate with Ghost AI" subtitle, close button
  - Tabbed layout (shadcn `Tabs`): AI Architect and Specs
  - AI Architect tab: scrollable chat area, empty state with starter chips, auto-resizing textarea input, send button; user/assistant message styling per spec
  - Specs tab: "Generate Spec" button, demo spec card with file icon, title, snippet, and disabled download action
  - Preserved floating `absolute` placement, slide animation (`translate-x-full` ↔ `translate-x-0` with transition), `bg-base/95`, `border-border-default`, shadow
  - Open/close state controlled by parent via `isOpen`/`onClose` props
- Canvas autosave with Vercel Blob (spec 21):
  - Installed `@vercel/blob` package
  - Renamed `canvasJsonPath` → `canvasBlobUrl` in Project model (`prisma/models/project.prisma`); created migration `20260528144727_rename_canvas_json_path_to_canvas_blob_url`
  - Created `app/api/projects/[id]/canvas/route.ts` — `PUT` handler receives `{ nodes, edges }`, uploads to Vercel Blob at `canvases/{id}.json`, stores returned URL on project record; `GET` handler reads blob URL from Prisma, fetches JSON from Blob, returns it; both routes use `getProjectAccess()` for owner/collaborator authorization
  - Created `hooks/use-canvas-autosave.ts` — watches `nodes`/`edges` arrays, debounces 2s, calls PUT API; returns `{ status, saveNow }` with `SaveStatus` type (`idle | saving | saved | error`)
  - Wired autosave into `FlowCanvas`: calls `useCanvasAutosave(projectId, nodes, edges)`; on mount, checks if Liveblocks room is empty (`nodes.length === 0 && edges.length === 0`), if so fetches saved state from GET API and loads via `onNodesChange`/`onEdgesChange`; uses ref to prevent re-load
  - Added save status indicator in canvas control bar — shows spinner icon (`saving`), cloud icon (`saved`), cloud-off icon (`error`) with color-coded text (muted/success/error)
  - Added `BLOB_READ_WRITE_TOKEN` to `.env.local` for local dev
  - `npm run build` passes, `npx tsc --noEmit` passes
  - Check: no saved canvas loads if room already has nodes/edges (`loadedRef` + early return)
  - Check: collaborators also authenticated via `auth()` (not owner-only); load returns 404 gracefully with empty `{ nodes: [], edges: [] }`

## Notes

- Dialog pattern: existing shadcn `Dialog` component uses color tokens from `globals.css` and supports title, description, and footer actions — ready for future use per spec.
- `proxy.ts` replaces `middleware.ts` (Next.js 16 convention). Uses protected-first strategy: blocks everything except `/`, `/sign-in/*`, `/sign-up/*`.
- Catch-all routes `[[...sign-in]]` / `[[...sign-up]]` auto-generated by Clerk SDK are used to cover all Clerk auth sub-paths (password reset, etc.).
- Clerk appearance `variables` use the same hex values from `globals.css` project tokens to avoid hardcoded colors.
- Project dialogs now backed by API — create, rename, delete hit `/api/projects` endpoints with optimistic local state updates. Rename/delete use `[id]` path parameter routes.
- `ProjectDialogProvider` context pattern used so editor home (page) and sidebar can both trigger dialogs rendered in the layout.
- `@vercel/blob` stores canvas JSON at `canvases/{id}.json`; in local dev it uses the file system under `.vercel/blob/` when `BLOB_READ_WRITE_TOKEN` is set.

## Architecture Decisions

- Tailwind v4 `@theme inline` used for all color tokens — no separate `:root` block needed since Tailwind v4 generates CSS custom properties from `@theme`
- shadcn component tokens (`--color-background`, `--color-foreground`, etc.) reference project semantic tokens for single-source-of-truth
- Auth route protection via `proxy.ts` (Next.js 16 Proxy convention) instead of `middleware.ts`
- Clerk `dark` theme from `@clerk/ui/themes` as base appearance, overridden via `variables` using project CSS token values
- Prisma client singleton branches on `DATABASE_URL` prefix: `prisma+postgres://` uses Accelerate (`accelerateUrl`), otherwise uses `@prisma/adapter-pg` with direct `connectionString`
- Models split into separate file under `prisma/models/` and referenced via `/// <reference>` directive
- Canvas state persistence: Vercel Blob stores raw JSON (nodes + edges), Prisma stores only the blob URL (metadata-only). This avoids storing large JSON payloads in the relational DB and keeps Vercel Blob as the single source of truth for canvas data.

## Session Notes

- Next.js 16 note: `priority` prop on `next/image` is deprecated in favor of `preload`
- Generated `components/ui/*` files are not modified per spec instructions

# UI Context

## Theme

Supports both dark and light mode. Dark is the default. The visual language is a technical workspace — layered surfaces, minimal chrome, and vivid accent colors for interactive elements.

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens via `@theme inline`. Components must use these tokens — no hardcoded hex values or raw Tailwind color classes like `zinc-*`.

### Color Tokens

| Role             | CSS Variable           | Dark                    | Light                   |
| ---------------- | ---------------------- | ----------------------- | ----------------------- |
| Page background  | `--bg-base`            | `#080809`               | `#f5f5f0`               |
| Surface          | `--bg-surface`         | `#111114`               | `#ffffff`               |
| Elevated surface | `--bg-elevated`        | `#18181c`               | `#f0efec`               |
| Subtle surface   | `--bg-subtle`          | `#1e1e23`               | `#e8e7e4`               |
| Default border   | `--border-default`     | `#2a2a30`               | `#d4d4d0`               |
| Subtle border    | `--border-subtle`      | `#3a3a42`               | `#c0c0bc`               |
| Primary text     | `--text-primary`       | `#f0f0f4`               | `#1a1a1e`               |
| Secondary text   | `--text-secondary`     | `#c0c0cc`               | `#3a3a42`               |
| Muted text       | `--text-muted`         | `#808090`               | `#808088`               |
| Faint text       | `--text-faint`         | `#505060`               | `#b0b0b8`               |
| Brand accent     | `--accent-primary`     | `#00c8d4` (cyan)        | `#00c8d4` (cyan)        |
| Brand dim        | `--accent-primary-dim` | `rgba(0, 200, 212, 0.12)` | `rgba(0, 200, 212, 0.10)` |
| AI accent        | `--accent-ai`          | `#6457f9` (indigo-purple) | `#6457f9` (indigo-purple) |
| AI text          | `--accent-ai-text`     | `#8b82ff`               | `#6b60e0`               |
| Error            | `--state-error`        | `#ff4d4f`               | `#e53e3e`               |
| Success          | `--state-success`      | `#34d399`               | `#2da573`               |
| Warning          | `--state-warning`      | `#fbbf24`               | `#d99f1c`               |

Brand accent and AI accent remain the same across modes — they're vivid enough to read on both dark and light backgrounds. State colors are slightly adjusted in light mode for better contrast on pale surfaces.

Tailwind utility names map to these variables. Use `bg-base`, `bg-surface`, `text-primary`, `text-muted`, `border-default`, `text-brand`, `bg-accent-primary-dim`, etc.

## Typography

| Role      | Font       | CSS Variable        |
| --------- | ---------- | ------------------- |
| UI text   | Geist Sans | `--font-geist-sans` |
| Code/mono | Geist Mono | `--font-geist-mono` |

Both fonts are loaded via `next/font/google` and applied as CSS variables on the `<html>` element. The base `body` uses Geist Sans with `antialiased`.

## Border Radius

Radius increases with surface depth — smaller for inner elements, larger for outer containers.

| Context           | Class         |
| ----------------- | ------------- |
| Inline / small UI | `rounded-xl`  |
| Cards / panels    | `rounded-2xl` |
| Modal / overlay   | `rounded-3xl` |

## Canvas

## Node Color Palette

8 defined color pairs. Each pair specifies a node fill and a vivid contrasting text color tuned for readability on the canvas. Designed for the dark canvas (default) — light mode uses the same palette since nodes are consistently dark-backed for visual weight regardless of surrounding UI mode. Defined in `types/canvas.ts` as `NODE_COLORS`.

| Node fill | Text color | Character              |
| --------- | ---------- | ---------------------- |
| `#1F1F1F` | `#EDEDED`  | Neutral dark (default) |
| `#10233D` | `#52A8FF`  | Blue                   |
| `#2E1938` | `#BF7AF0`  | Purple                 |
| `#331B00` | `#FF990A`  | Orange                 |
| `#3C1618` | `#FF6166`  | Red                    |
| `#3A1726` | `#F75F8F`  | Pink                   |
| `#0F2E18` | `#62C073`  | Green                  |
| `#062822` | `#0AC7B4`  | Teal                   |

Default node color: `#1F1F1F` with `#EDEDED` text.

### Edge Style

Smooth-step path with an arrow marker. Default edge color: `#f8fafc`. Stroke width is thin — edges are visually secondary to nodes.

### Node Shapes

6 supported shapes, defined in `types/canvas.ts` as `NODE_SHAPES`. Complex shapes (diamond, hexagon, cylinder) are rendered as inline SVGs rather than CSS borders.

- `rectangle` — default general-purpose node
- `diamond` — decision / gateway
- `circle` — event / endpoint
- `pill` — service / process
- `cylinder` — database / storage
- `hexagon` — external system / boundary

### Connection Handles

Small white circular handles, hidden by default, revealed on node hover. Appear at all four sides of a node.

### Canvas Background

React Flow `<Background>` component. Canvas sits on the base background color, which adapts to the active theme (near-black in dark mode, off-white in light mode). The dot pattern uses a subtle contrast color that works in both modes.

## Component Library

shadcn/ui on top of Tailwind. No custom design system. Components live in `components/ui/`. Use the `shadcn` CLI to add new components rather than writing them from scratch.

## Layout Patterns

- Editor workspace: full-viewport layout — floating sidebar overlay on the left, center canvas, slide-over AI sidebar on the right.
- Sidebars: floating overlay with semi-transparent background (`bg-base/95` in dark, `bg-base/90` in light) and subtle border.
- Modals and dialogs: centered overlay, `rounded-3xl`, elevated surface background with backdrop blur.
- Navbar: top bar with surface background and bottom border.

## Icons

Lucide React. Stroke-based icons only — no filled variants. Icon sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons, `h-8 w-8` for feature icons in empty states.

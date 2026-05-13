We need the base chrome components that fram every editor screen - the top navigotor and the left sidebar shell. These will be reused and extend in every chapter that follows.

### Editor Navbar

Create `components/editor/editor-navbar.tsx`

Requirements:
- fixed height top Navbar
- left, center, and right section
- left section contains sidebar
- use `PanelLeftOpen` / `PanelLeftClose` icons based on sidebar state
- right section stays empty for now
- dark background with subtle bottom border

### Project sidebar

Create `componnets/editor/project-sidebar.tsx`

Requirements:

- sidebar should float above the editor canvas
- opening it should not push page content
- slide in from the left
- accepts `isOpen`  prop
- header with 'Projects' title + close button
- shadcn `Tabs`:
    - My Projects
    - Shared
- both tabs show empty placeholder state
- full-width `New Project` button at the bottom with the "Plus" icons


### Dialog Pattern

Use the existing color token from `global.css` for dialog styling

Supports:
- title
- description
- footer actions

Do not build actual dialogs yet. 

### Check when done

- new components compiled without Typescript Errors
- no lint error 
- dialog pattern is ready for future use.





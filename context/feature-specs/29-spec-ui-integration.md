Integrate spec generation results into the editor so users can view, preview, and download specs from the exiting ai sidebar specs tab.

### Implementation

1. Spec list

- in the right sidebar ( Specs tab), show a list of specs for the current project
- fetch spec from the backend using the existing ProjectSpec API
- display:
    - createdAt
    - filename
- keep items simple and clickable

2. Preview modal

- open a modal when a spec is selected
- fetch the spec content through and existing endpoint( do not access Blob directly from the client)
- render context as markdown
- include a close action and basic keyboard support

3. Download action

- add a download action for each spec ( list item + modal)
- call the download endpoint
- let the browser handle the file download

### UI Details

- use existing sidebar layout, do not redesign
- use shadcn.ui components ( Dialog, Scroll Area, Button)
- use existing colors and tokesn from `global.css`
- follow `ui-context.md` for spacing and layout
- kepp the list compace the scrollable

### Scope Limits

- do not implement backend logic
- do not fetch Blob URLS directly in the client
- do not store spec content in the frontend state long-term
- do not redesign the sidebar or tabs
- do not add new global state

### Notes

- reuse existing fetch patterns used in the app
- assume ProjectSpec only provided metadata, content must be fetched seperately

### Check When Done

- spec list loads for the current project
- modal shows rendered Markdown content
- download action triggers file download
- TypeScript and build pass



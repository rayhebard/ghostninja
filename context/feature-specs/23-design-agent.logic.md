Implement the full Ai design agent so a user prompt resultes in real-time updates to the collaborative canvas, with visible AI presence and status.

## Implementation

1. Update the design agent task in `trigger/design-agent.ts`

    Befor implementing:
    - check `context/project-overview.md` and `context\architecture-context.md` for product behavior and system resultes
    - Before implementing, check Liveblock and Trigger.dev agent skills for current patterns on canvas mutation and background task execution
    - follow the existing Trigger.dev setup and agent patterns already in the project
    - reuse existing Liveblocks flow and presence patterns instead of creating new ones

    Then implement:
    - use Gemint(`@ai-sdk/google`) to interpret the user prompt
    - update the canvas using the existing collaborative flow utilities
    - support actions like:
        - add node
        - move node
        - resize node
        - update node data
        - delete node
        - add edge
        - delete edge

    - publish AI activity to the shared status feed so all users see progress
    - update AI presence ( cursor + thinking rate) while the task runs
    - push clear status messages at key steps ( start, processing, complete)
    - ensure generated designs follow:
        - allow node shapes
        - color pallette
        - layout and spacing rules

    - handle errors gracefully and update status if something fails
    - clear AI presense when the task finishes

## Dependencies

All packages are already installed.`GOOGLE_AI_API_KEY` is already in `env.local`

## Scope Limits

- don't change canvas architecture 
- don't introduce a new state system outside Liveblocks
- don't bypass existing collaborative flow utilities

## Check When Done

- Design task updates the canvas through the existing collaborative flow.
- AI presence and status are visible to all participants.
- Status message reflect task progress.
- Errors are handled without breaking the canvas.
- `npm run build` passes. 

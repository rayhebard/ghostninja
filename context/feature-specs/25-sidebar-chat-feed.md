Add real-time room chat to the AI sidebard using a seperateLiveblocks `ai-chat` feed.

This is only for the chat messages. Keep it seperate from `ai-status-feed`, which handles AI progress and presence updates.

## Implementation

1. Add the `ai-chat` feed.

    Before implementing, check the existing Liveblocks setup and follow same feed patterns already used in the project.
    - create or resuse a Liveblocks feed names `ai-chat`
    - keep it room-scoped
    - do not mix it with `ai-status-feed`

2. Wire the chat feed into the sidebar.
    - subscribe to `ai-chat` in the sidebar chat area 
    - render the chat message in order 
    - show sender, timestamp, and message content
    - keep the styling consistent with the existing sidebar UI 
    - use Tailwind utilities and existing shadcn components where they fit

3. Add message sending. 
    - allow users in the room to send message to `ai-chat`
    - use the existing sidebar input and send button
    - clear the input after a succesful send
    - show a small error state if sending fails

4. Add message validation.
    - define or reuse a Zod schema in `types/task.ts`
    - message shape should include sender, role, content, and timestamp
    - validate feed message before rendering them

## Scope Limits

- don't add AI-generated replies yet
- don't trigger backend AI tasks
- don't mix chat messages with status messages
- don't create a parallel realtime system outside Liveblocks
- keep this focused on collaborative sidebar chat only

## Check when done

- Sidebar subscribe to the `ai-chat` feed. 
- Users can send chat messages through the existing sidebar input.
- Chat messages are validated before rendering.
- `ai-chat` remains seperate from `ai-status-feed`
- `npm run build` passes.

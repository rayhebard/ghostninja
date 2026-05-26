import type { LiveblocksFlow } from "@liveblocks/react-flow"

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      isThinking: boolean;
    };

    Storage: {
      flow: LiveblocksFlow;
    };

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    RoomEvent: {};

    ThreadMetadata: {};

    RoomInfo: {};
  }
}

export {};

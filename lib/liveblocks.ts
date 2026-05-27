const LIVEBLOCKS_API = "https://api.liveblocks.io/v2";

function secret(): string {
  const key = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!key) throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
  return key;
}

const CURSOR_PALETTE = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
  "#F0B27A", "#82E0AA", "#F1948A", "#85929E", "#73C6B6",
  "#E59866", "#AED6F1", "#D7BDE2", "#A3E4D7", "#FAD7A0",
];

export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0;
  }
  return CURSOR_PALETTE[Math.abs(hash) % CURSOR_PALETTE.length];
}

export async function ensureRoomExists(roomId: string): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(
      `${LIVEBLOCKS_API}/rooms?idempotent=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: roomId,
          defaultAccesses: [],
        }),
        signal: controller.signal,
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to create Liveblocks room: ${res.status} ${body}`);
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Timeout creating Liveblocks room for "${roomId}" at ${LIVEBLOCKS_API}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function authorizeUser(params: {
  userId: string;
  userInfo: { name: string; avatar: string; color: string };
  roomId: string;
}): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${LIVEBLOCKS_API}/authorize-user`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: params.userId,
        userInfo: params.userInfo,
        permissions: {
          [params.roomId]: ["room:write"],
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Liveblocks authorize failed: ${res.status} ${body}`);
    }

    const data = await res.json() as { token: string };
    return data.token;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Timeout authorizing user "${params.userId}" for room "${params.roomId}" at ${LIVEBLOCKS_API}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

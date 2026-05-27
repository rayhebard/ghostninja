import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getProjectAccess } from "@/lib/project-access";
import { ensureRoomExists, authorizeUser, getUserColor } from "@/lib/liveblocks";

export async function POST(request: Request) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let roomId: string;
  try {
    const body = await request.json();
    roomId = body.room;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof roomId !== "string" || !roomId) {
    return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
  }

  const access = await getProjectAccess(roomId);
  if (!access.hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await currentUser();
  
  // Extract user name with multiple fallbacks
  let name = "User";
  if (user) {
    if (user.fullName && user.fullName.trim()) {
      name = user.fullName;
    } else if (user.firstName && user.firstName.trim()) {
      const lastName = user.lastName?.trim() || "";
      name = lastName ? `${user.firstName} ${lastName}` : user.firstName;
    } else if (user.username && user.username.trim()) {
      name = user.username;
    } else if (user.emailAddresses && user.emailAddresses.length > 0) {
      const email = user.emailAddresses[0]?.emailAddress;
      if (email) {
        name = email.split("@")[0];
      }
    }
  }
  
  const avatar = user?.imageUrl ?? "";
  const color = getUserColor(session.userId);

  try {
    await ensureRoomExists(roomId);
  } catch {
    return NextResponse.json(
      { error: "Failed to initialize room" },
      { status: 500 },
    );
  }

  try {
    const token = await authorizeUser({
      userId: session.userId,
      userInfo: { name, avatar, color },
      roomId,
    });

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "Failed to authorize session" },
      { status: 500 },
    );
  }
}

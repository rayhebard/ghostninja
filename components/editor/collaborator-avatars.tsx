"use client"

import { useOthers } from "@liveblocks/react"
import { useUser } from "@clerk/nextjs"

function Avatar({
  src,
  name,
  color,
}: {
  src?: string
  name: string
  color: string
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="relative -ml-2 first:ml-0 flex items-center justify-center overflow-hidden rounded-full border-2 border-base"
      style={{ width: 28, height: 28, backgroundColor: color }}
      title={name}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-[10px] font-semibold leading-none text-white select-none">
          {initials}
        </span>
      )}
    </div>
  )
}

export function CollaboratorAvatars() {
  const others = useOthers()
  const { user } = useUser()
  
  // Filter to exclude the current user, showing only collaborators
  const collaborators = user?.id 
    ? others.filter(other => other.id !== user.id)
    : others

  if (collaborators.length === 0) return null

  const visible = collaborators.slice(0, 5)
  const overflow = collaborators.length - 5

  return (
    <>
      {visible.map((c) => (
        <Avatar
          key={c.connectionId}
          src={c.info?.avatar}
          name={c.info?.name ?? "Anonymous"}
          color={c.info?.color ?? "#666"}
        />
      ))}
      {overflow > 0 && (
        <div
          className="relative -ml-2 flex items-center justify-center rounded-full border-2 border-base bg-elevated"
          style={{ width: 28, height: 28 }}
          title={`${overflow} more`}
        >
          <span className="text-[10px] font-semibold text-copy-muted select-none">
            +{overflow}
          </span>
        </div>
      )}
      <div className="mx-1 h-5 w-px bg-border-default" />
    </>
  )
}

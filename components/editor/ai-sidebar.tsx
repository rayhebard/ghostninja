"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { X, Bot, Sparkles, FileText, Download, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useFeeds, useCreateFeed, useFeedMessages, useCreateFeedMessage } from "@liveblocks/react"
import { useUser } from "@clerk/nextjs"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import type { AiStatusPayload } from "@/types/canvas"
import { AiChatMessageSchema } from "@/types/task"
import type { designAgent } from "@/trigger/design-agent"
import type { RealtimeRun } from "@trigger.dev/core/v3"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
  aiStatus?: AiStatusPayload | null
  projectId: string
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

export function AiSidebar({ isOpen, onClose, aiStatus, projectId }: AiSidebarProps) {
  const [input, setInput] = useState("")
  const [sendError, setSendError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [publicToken, setPublicToken] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { user } = useUser()
  const { feeds } = useFeeds()
  const createFeed = useCreateFeed()
  const { messages: feedMessages } = useFeedMessages("ai-chat")
  const createFeedMessage = useCreateFeedMessage()

  const senderName = user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || "Anonymous"
  const isRunActive = isSubmitting || !!runId

  const { run } = useRealtimeRun<typeof designAgent>(runId ?? undefined, {
    accessToken: publicToken ?? undefined,
    enabled: !!runId && !!publicToken,
    onComplete: useCallback(
      async (runResult: RealtimeRun<typeof designAgent>) => {
        const output = runResult.output as
          | { status?: string; nodesGenerated?: number; edgesGenerated?: number }
          | undefined
        const content =
          output?.status === "complete"
            ? `Design generated with ${output.nodesGenerated} nodes and ${output.edgesGenerated} edges`
            : "Could not generate a design from that prompt"
        try {
          await createFeedMessage("ai-chat", {
            sender: "AI Architect",
            role: "assistant",
            content,
            timestamp: Date.now(),
          })
        } catch {
          // silent
        }
        setRunId(null)
        setPublicToken(null)
      },
      [createFeedMessage],
    ),
  })

  useEffect(() => {
    if (!feeds) return
    const exists = feeds.some((f) => f.feedId === "ai-chat")
    if (!exists) {
      createFeed("ai-chat").catch(() => {})
    }
  }, [feeds, createFeed])

  const validatedMessages = (feedMessages ?? [])
    .map((msg) => {
      const parsed = AiChatMessageSchema.safeParse(msg.data)
      if (parsed.success) {
        return { ...parsed.data, id: msg.id }
      }
      return null
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)

  const submitPrompt = useCallback(
    async (text: string) => {
      if (isRunActive) return
      setSendError(null)
      setIsSubmitting(true)
      try {
        await createFeedMessage("ai-chat", {
          sender: senderName,
          role: "user",
          content: text,
          timestamp: Date.now(),
        })
      } catch {
        setSendError("Failed to send message")
        setIsSubmitting(false)
        return
      }

      try {
        const res = await fetch("/api/ai/design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text, roomId: projectId, projectId }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          await createFeedMessage("ai-chat", {
            sender: "System",
            role: "assistant",
            content: err.error || "Failed to start design task",
            timestamp: Date.now(),
          }).catch(() => {})
          setIsSubmitting(false)
          return
        }
        const { runId: newRunId } = await res.json()

        const tokenRes = await fetch("/api/ai/design/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId: newRunId }),
        })
        if (!tokenRes.ok) {
          await createFeedMessage("ai-chat", {
            sender: "System",
            role: "assistant",
            content: "Failed to get access token",
            timestamp: Date.now(),
          }).catch(() => {})
          setIsSubmitting(false)
          return
        }
        const { token } = await tokenRes.json()

        setRunId(newRunId)
        setPublicToken(token)
      } catch {
        setSendError("Network error")
        await createFeedMessage("ai-chat", {
          sender: "System",
          role: "assistant",
          content: "Network error: failed to send message",
          timestamp: Date.now(),
        }).catch(() => {})
      }
      setIsSubmitting(false)
    },
    [senderName, projectId, createFeedMessage, isRunActive],
  )

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
    await submitPrompt(text)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleStarterClick = async (chip: string) => {
    if (isRunActive) return
    await submitPrompt(chip)
  }

  return (
    <aside
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
      className={`absolute right-0 top-0 bottom-0 w-72 border-l border-border-default bg-base/95 z-30 flex flex-col shadow-2xl transition-transform duration-200 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } ${isOpen ? "" : "pointer-events-none"}`}
    >
      <div className="flex items-start justify-between gap-2 p-4 border-b border-border-default">
        <div className="flex items-center gap-2 min-w-0">
          <Bot className="h-5 w-5 text-ai-text shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-copy-primary truncate">
              AI Workspace
            </h2>
            <p className="text-xs text-copy-muted truncate">
              Collaborate with Ghost AI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {aiStatus?.text && (
            <div className="flex items-center gap-1.5 rounded-full bg-ai/10 px-2.5 py-1 text-xs text-ai-text">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="truncate max-w-[100px]">{aiStatus.text}</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 shrink-0" aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="architect" className="flex flex-col flex-1 overflow-hidden">
        <div className="px-4 pt-3 pb-1">
          <TabsList className="w-full">
            <TabsTrigger
              value="architect"
              className="flex-1 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=inactive]:text-copy-muted"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="flex-1 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=inactive]:text-copy-muted"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="architect" className="flex flex-col flex-1 overflow-hidden p-0 m-0">
          {validatedMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
              <Bot className="h-10 w-10 text-ai-text" />
              <p className="text-sm text-copy-muted leading-relaxed">
                Ask AI to design or modify your architecture
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {STARTER_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleStarterClick(chip)}
                    className="rounded-full px-3 py-1.5 text-xs bg-subtle text-ai-text hover:opacity-80 transition-opacity"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 px-4">
              <div className="py-3 space-y-3">
                {validatedMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                       className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                         msg.role === "user"
                           ? "text-copy-primary"
                           : "bg-elevated border border-border-default text-ai-text"
                       }`}
                       style={msg.role === "user" ? { backgroundColor: "#62C073", border: "2px solid #62C073" } : undefined}
                     >
                      <span className="block text-[10px] opacity-60 mb-1">
                        {msg.sender}
                      </span>
                      {msg.content}
                      <span className="block text-[10px] opacity-40 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="p-4 border-t border-border-default">
            {sendError && (
              <p className="text-xs text-state-error mb-2">{sendError}</p>
            )}
            {isRunActive && aiStatus?.text && (
              <div className="mb-2 flex items-center gap-2 rounded-md bg-surface px-3 py-1.5 text-xs text-ai-text border-l-2 border-[#62C073]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#62C073] animate-pulse shrink-0" />
                <span className="truncate">{aiStatus.text}</span>
              </div>
            )}
            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={isRunActive ? "AI is working…" : "Ask AI..."}
                className="min-h-[72px] max-h-[160px] resize-none text-sm"
                rows={1}
                disabled={isRunActive}
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="h-11 w-11 shrink-0 text-white hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#62C073" }}
                aria-label="Send message"
                disabled={isRunActive}
              >
                {isRunActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="flex flex-col flex-1 overflow-hidden p-0 m-0">
          <div className="flex flex-col gap-3 p-4">
            <Button className="w-full bg-accent text-white hover:bg-accent/80">
              <Sparkles className="h-4 w-4" />
              Generate Spec
            </Button>

            <div className="rounded-lg border border-border-default bg-elevated p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-ai-text mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-copy-primary">
                    API Gateway Spec
                  </h4>
                  <p className="text-xs text-copy-muted mt-1 line-clamp-2">
                    Defines the REST API endpoints for the e-commerce platform
                    including product catalog, user auth, and order management
                    with rate limiting.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="mt-2 h-8 px-2 text-xs text-copy-muted"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}

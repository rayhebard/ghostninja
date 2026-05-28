"use client"

import { useRef, useState } from "react"
import { X, Bot, Sparkles, FileText, Download, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
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

  const handleStarterClick = (chip: string) => {
    setMessages((prev) => [...prev, { role: "user", content: chip }])
    setInput("")
  }

  return (
    <aside
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
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 shrink-0">
          <X className="h-4 w-4" />
        </Button>
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
          {messages.length === 0 ? (
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
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-brand-dim border-brand/50 border-2 text-copy-primary"
                          : "bg-elevated border border-border-default text-ai-text"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="p-4 border-t border-border-default">
            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI..."
                className="min-h-[72px] max-h-[160px] resize-none text-sm"
                rows={1}
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="h-11 w-11 shrink-0 bg-accent text-white hover:bg-accent/80"
              >
                <Send className="h-4 w-4" />
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

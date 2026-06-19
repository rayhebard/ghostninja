import { z } from "zod"

export const AiStatusSchema = z.object({
  text: z.string().optional(),
})

export type AiStatus = z.infer<typeof AiStatusSchema>

export const AiChatMessageSchema = z.object({
  sender: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  timestamp: z.number(),
})

export type AiChatMessage = z.infer<typeof AiChatMessageSchema>

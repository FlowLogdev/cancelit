"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"

interface BotMessage {
  role: "assistant" | "user"
  content: string
}

const FREE_MESSAGE_LIMIT = 10
const FREE_MESSAGE_STORAGE_KEY = "cancelit_bot_free_messages"
const UPGRADE_URL = "/pricing"
const UPGRADE_MESSAGE =
  "You've used the 10 free CancelIt Bot messages. To keep getting personalized savings and cancellation help, choose a CancelIt subscription."

const initialMessages: BotMessage[] = [
  {
    role: "assistant",
    content:
      "How can I help you today? Tell me a subscription name and I can suggest where to cancel it, how to downgrade, or where you may save money.",
  },
]

const quickPrompts = ["How do I cancel Netflix?", "Where can I save this month?", "Help me cancel Adobe"]

function getStoredMessageCount() {
  if (typeof window === "undefined") {
    return 0
  }

  const parsedValue = Number.parseInt(window.localStorage.getItem(FREE_MESSAGE_STORAGE_KEY) || "0", 10)

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return 0
  }

  return Math.min(parsedValue, FREE_MESSAGE_LIMIT)
}

function persistMessageCount(count: number) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(FREE_MESSAGE_STORAGE_KEY, String(Math.min(Math.max(count, 0), FREE_MESSAGE_LIMIT)))
}

function appendUpgradeMessage(messages: BotMessage[]) {
  if (messages.some((message) => message.role === "assistant" && message.content === UPGRADE_MESSAGE)) {
    return messages
  }

  return [...messages, { role: "assistant" as const, content: UPGRADE_MESSAGE }]
}

export function CancelItBotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<BotMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const freeLimitReached = sentCount >= FREE_MESSAGE_LIMIT
  const remainingMessages = Math.max(FREE_MESSAGE_LIMIT - sentCount, 0)

  useEffect(() => {
    const storedCount = getStoredMessageCount()
    setSentCount(storedCount)

    if (storedCount >= FREE_MESSAGE_LIMIT) {
      setMessages((currentMessages) => appendUpgradeMessage(currentMessages))
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, loading, open])

  const syncUsage = (usage: unknown, fallbackCount: number) => {
    const used = typeof usage === "object" && usage && "used" in usage ? Number((usage as { used: unknown }).used) : fallbackCount
    const safeUsed = Number.isFinite(used) ? Math.min(Math.max(used, 0), FREE_MESSAGE_LIMIT) : fallbackCount

    setSentCount(safeUsed)
    persistMessageCount(safeUsed)

    return safeUsed
  }

  const sendMessage = async (message: string) => {
    const trimmed = message.trim()

    if (!trimmed || loading) {
      return
    }

    const nextMessages: BotMessage[] = [...messages, { role: "user", content: trimmed }]
    setInput("")

    if (sentCount >= FREE_MESSAGE_LIMIT) {
      setMessages(appendUpgradeMessage(nextMessages))
      return
    }

    setMessages(nextMessages)
    setLoading(true)

    const optimisticCount = Math.min(sentCount + 1, FREE_MESSAGE_LIMIT)
    setSentCount(optimisticCount)
    persistMessageCount(optimisticCount)

    try {
      const response = await fetch("/api/cancelit-bot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-6),
        }),
      })

      const data = await response.json()
      const usedCount = syncUsage(data?.usage, optimisticCount)

      if (data?.limitReached) {
        setMessages(appendUpgradeMessage([...nextMessages, { role: "assistant", content: data.reply || UPGRADE_MESSAGE }]))
        return
      }

      if (!response.ok) {
        throw new Error(data?.error || "CancelIt Bot is unavailable")
      }

      const reply = data.reply || "I can help with cancellation paths and savings ideas."
      const responseMessages: BotMessage[] = [...nextMessages, { role: "assistant", content: reply }]

      setMessages(usedCount >= FREE_MESSAGE_LIMIT ? appendUpgradeMessage(responseMessages) : responseMessages)
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "I could not reach the assistant right now. You can still tell me the merchant name, then try again in a moment.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage(input)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-1/2 z-[80] flex -translate-y-1/2 items-center gap-2 rounded-full border border-white/12 bg-black/88 px-4 py-3 text-sm font-semibold text-white shadow-[0_22px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl transition hover:border-red-300/50 hover:bg-[#111] sm:right-6"
        aria-label="Open CancelIt Bot"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white">
          <Bot className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="hidden sm:inline">CancelIt Bot</span>
      </button>
    )
  }

  return (
    <aside className="fixed bottom-4 right-4 z-[80] w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/12 bg-black/90 text-white shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:bottom-auto sm:right-6 sm:top-1/2 sm:-translate-y-1/2">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.035] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white shadow-sm shadow-red-500/30">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold">CancelIt Bot</p>
            <p className="text-xs text-white/52">Savings and cancellation help</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/52 transition hover:bg-white/10 hover:text-white"
          aria-label="Close CancelIt Bot"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div ref={scrollRef} className="max-h-[21rem] space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                message.role === "user"
                  ? "bg-red-500 text-white"
                  : "border border-white/10 bg-white/[0.055] text-white/78"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-3.5 py-2.5 text-sm text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Checking cancellation paths
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        <div className="mb-3 flex items-center justify-between gap-3 text-[11px] leading-4 text-white/42">
          <span>
            {freeLimitReached
              ? "Free message limit reached"
              : `${remainingMessages} free message${remainingMessages === 1 ? "" : "s"} left`}
          </span>
          <a href={UPGRADE_URL} className="font-semibold text-red-300 transition hover:text-red-200">
            Subscription plans
          </a>
        </div>

        {freeLimitReached && (
          <a
            href={UPGRADE_URL}
            className="mb-3 flex w-full items-center justify-center rounded-xl bg-red-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Buy a subscription to keep chatting
          </a>
        )}

        <div className="mb-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendMessage(prompt)}
              disabled={loading || freeLimitReached}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/62 transition hover:border-red-300/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <label className="sr-only" htmlFor="cancelit-bot-message">
            Ask CancelIt Bot
          </label>
          <textarea
            id="cancelit-bot-message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={freeLimitReached ? "Subscribe to keep chatting..." : "Ask how to cancel or save..."}
            rows={1}
            maxLength={700}
            disabled={freeLimitReached}
            className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2.5 text-sm leading-6 text-white outline-none transition placeholder:text-white/32 focus:border-red-300/50 disabled:cursor-not-allowed disabled:opacity-55"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                void sendMessage(input)
              }
            }}
          />
          <Button
            type="submit"
            disabled={loading || freeLimitReached || !input.trim()}
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            aria-label="Send message"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] leading-4 text-white/34">
          <MessageCircle className="h-3 w-3" aria-hidden="true" />
          Do not share passwords, OTPs, full card numbers, or bank credentials.
        </div>
      </div>
    </aside>
  )
}

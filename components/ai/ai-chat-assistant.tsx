"use client"

import type React from "react"

import { useState } from "react"
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface AIChatAssistantProps {
  isPaidUser: boolean
  tier?: string
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export function AIChatAssistant({ isPaidUser, tier = "free" }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "I can help review your recurring charges, pick likely cancellations, and walk you through where to cancel. Ask me about a service or ask what to cut first.",
    },
  ])

  const quickQuestions = [
    "What should I cancel first?",
    "How much am I spending monthly?",
    "Guide me through cancelling Adobe",
    "Which subscriptions renew soon?",
  ]

  const askAssistant = async (question: string) => {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || isLoading) return

    setInput("")
    setMessages((current) => [...current, { role: "user", content: trimmedQuestion }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedQuestion }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Assistant is unavailable.")
      }

      setMessages((current) => [...current, { role: "assistant", content: data.reply }])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "I could not answer that right now.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    askAssistant(input)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Button
        onClick={() => setIsOpen((open) => !open)}
        size="icon"
        className="h-14 w-14 rounded-xl border border-red-400/30 bg-red-500 text-white shadow-2xl shadow-red-950/30 hover:bg-red-600"
        aria-label={isOpen ? "Close savings assistant" : "Open savings assistant"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </Button>

      {isOpen ? (
        <section className="absolute bottom-16 right-0 flex h-[min(640px,calc(100dvh-7rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#090909] shadow-2xl shadow-black/60">
          <header className="border-b border-white/[0.08] px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-red-300" />
                  <h2 className="font-semibold">Savings assistant</h2>
                </div>
                <p className="mt-1 text-xs text-white/42">Plan: {tier}</p>
              </div>
              <Badge className="border-white/10 bg-white/[0.06] text-white/58">
                {isPaidUser ? "active" : "preview"}
              </Badge>
            </div>
          </header>

          {!isPaidUser ? (
            <div className="flex flex-1 flex-col justify-center p-5 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-200">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">AI guidance starts on Medium.</h3>
              <p className="mt-2 text-sm leading-6 text-white/48">
                Minimum keeps tracking simple. Medium adds savings recommendations, renewal review, and cancellation guidance.
              </p>
              <Button className="mt-5 bg-red-500 text-white hover:bg-red-600" onClick={() => (window.location.href = "/pricing")}>
                View plans
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div
                      className={`max-w-[84%] whitespace-pre-wrap rounded-xl px-3.5 py-3 text-sm leading-6 ${
                        message.role === "user" ? "bg-red-500 text-white" : "bg-white/[0.055] text-white/72"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {isLoading ? (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-2 rounded-xl bg-white/[0.055] px-3.5 py-3 text-sm text-white/48">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Reviewing your subscriptions
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-white/[0.08] p-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => askAssistant(question)}
                      className="rounded-md border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 text-xs text-white/54 transition-colors hover:border-red-300/30 hover:text-white"
                    >
                      {question}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask what to cancel..."
                    disabled={isLoading}
                    className="border-white/[0.08] bg-white/[0.045] text-white placeholder:text-white/30"
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-red-500 text-white hover:bg-red-600">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </section>
      ) : null}
    </div>
  )
}

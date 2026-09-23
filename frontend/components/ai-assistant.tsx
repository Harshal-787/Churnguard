"use client"

import { useState, useRef, useEffect } from "react"
import { Send, X, Loader2, Minimize2, Maximize2 } from "lucide-react"
import { usePathname } from "next/navigation"
import { api } from "@/lib/api"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const LogoIcon = ({ className }: { className?: string }) => (
  <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M3 9.5L16 17M29 9.5L16 17M16 30V17" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
    <circle cx="16" cy="17" r="3" fill="currentColor"/>
  </svg>
)

type Message = {
  role: "user" | "model"
  content: string
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Hi! I am the ChurnGuard AI. I can analyze customer risk profiles and financial data. How can I help you today?" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const pathname = usePathname()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      // Determine context based on current page
      let context = null
      if (pathname.includes("/customers/")) {
        const customerId = pathname.split("/").pop()
        context = { "Current Page": `Customer Profile`, "Customer ID": customerId }
      } else if (pathname.includes("/analytics")) {
        context = { "Current Page": "Model Analytics & Data Drift" }
      }

      // We send the full message history to the backend
      const response = await api<{ reply: string }>("/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          context: context
        })
      })

      if (response.error) {
        throw new Error(response.error)
      }

      setMessages(prev => [...prev, { role: "model", content: response.data!.reply }])
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: "model", 
        content: `Error: ${error.message}. Please check if GEMINI_API_KEY is configured in the backend.` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3.5 rounded-full bg-primary text-primary-foreground shadow-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:scale-105 z-50 flex items-center justify-center border border-primary/20 backdrop-blur-md"
      >
        <LogoIcon className="w-7 h-7 drop-shadow-md text-primary-foreground" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 ${
      isExpanded ? "w-[600px] h-[80vh]" : "w-[380px] h-[550px]"
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-muted/50 to-background p-4 border-b border-border/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center shadow-sm">
            <LogoIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-tight">ChurnGuard AI</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Enterprise Copilot</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 hover:bg-muted rounded-md text-muted-foreground">
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-md text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
              msg.role === "user" 
                ? "bg-primary text-primary-foreground rounded-br-sm shadow-md" 
                : "bg-muted/70 rounded-bl-sm border border-border/50 shadow-sm"
            }`}>
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-background/80 prose-pre:border prose-pre:border-border/50">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm p-4">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-background/50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about retention or churn risk..."
            className="w-full pl-4 pr-12 py-3 rounded-full bg-muted/50 border-none focus:ring-1 focus:ring-primary text-sm outline-none"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 transition-all hover:scale-105 hover:shadow-md"
          >
            <Send className="w-3.5 h-3.5 -ml-0.5" />
          </button>
        </div>
        <div className="text-[10px] text-center text-muted-foreground mt-2">
          AI can make mistakes. Verify critical financial data.
        </div>
      </form>
    </div>
  )
}

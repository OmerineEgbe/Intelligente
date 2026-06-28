'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { BrainCircuit, Send, X, MessageSquare } from 'lucide-react'

export function GuidanceModeWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/conversation' }),
    id: 'guidance-mode',
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const text = input
    setInput('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sendMessage as any)({ role: 'user', parts: [{ type: 'text', text }] })
  }

  const getMessageText = (msg: any): string => {
    if (msg.parts && Array.isArray(msg.parts)) {
      return msg.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text ?? '').join('')
    }
    if (typeof msg.content === 'string') return msg.content
    return ''
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 sm:w-96 h-[480px] bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#0c1f4a] text-white">
            <div className="flex items-center gap-2">
              <BrainCircuit size={16} />
              <span className="text-sm font-medium">Guidance Mode</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-[#94a3b8] text-center pt-4">
                Ask me anything about your programme, career options, or next steps.
              </p>
            )}
            {messages.map((msg, idx) => {
              const text = getMessageText(msg)
              return (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                    (msg as any).role === 'user'
                      ? 'bg-[#0c1f4a] text-white rounded-tr-none'
                      : 'bg-[#f1f5f9] text-[#0c1f4a] border border-[#e2e8f0] rounded-tl-none'
                  }`}>
                    {text}
                  </div>
                </div>
              )
            })}
            {isLoading && (
              <div className="flex gap-1.5 pl-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#0c1f4a]/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <div className="border-t border-[#e2e8f0] p-3 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a quick question…"
              disabled={isLoading}
              className="flex-1 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-[#0c1f4a] placeholder-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#1a3461]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-lg bg-[#0c1f4a] flex items-center justify-center text-white disabled:opacity-40"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-[#0c1f4a] flex items-center justify-center text-white shadow-lg hover:bg-[#1a3461] transition-colors"
      >
        {open ? <X size={20} /> : <MessageSquare size={20} />}
      </button>
    </div>
  )
}

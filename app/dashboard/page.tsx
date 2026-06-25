'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import {
  BrainCircuit,
  Plus,
  Send,
  Settings,
  LogOut,
  Menu,
  X,
  Square,
  ChevronDown,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from '@/lib/auth-client'

const suggestions = [
  'What programs suit someone interested in AI and technology?',
  'Help me explore careers in business management.',
  'What is the entry requirement for the MSc Data Science?',
  'Compare Software Engineering vs Computer Science at LMUI.',
]

export default function DashboardPage() {
  const router = useRouter()
  const session = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState<{ id: string; title: string }[]>([])
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (session && !session?.data?.user) {
      router.push('/sign-in')
    }
  }, [session?.data?.user, router])

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Save first message as conversation title
  useEffect(() => {
    if (messages.length === 2 && conversations.length === 0) {
      const aiMsg = messages.find((m) => m.role === 'assistant')
      if (aiMsg) {
        const text = typeof aiMsg.content === 'string'
          ? aiMsg.content
          : JSON.stringify(aiMsg.content)
        setConversations([{ id: Date.now().toString(), title: text.slice(0, 45) + '…' }])
      }
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const text = input
    setInput('')
    await sendMessage({ role: 'user', content: text })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/sign-in')
  }

  const getMessageText = (content: any): string => {
    if (typeof content === 'string') return content
    if (Array.isArray(content)) {
      return content
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('')
    }
    return ''
  }

  const userName = session?.data?.user?.name ?? 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  if (!session?.data?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#0c1f4a] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } flex-shrink-0 transition-[width] duration-300 overflow-hidden bg-[#0c1f4a] flex flex-col`}
      >
        <div className="flex flex-col h-full p-4 min-w-64">
          <div className="flex items-center justify-between mb-6 mt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                <BrainCircuit size={14} className="text-white" />
              </div>
              <span className="font-bold text-white">Intelligente</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white/40 hover:text-white transition-colors lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm mb-6"
          >
            <Plus size={16} />
            New Conversation
          </button>

          <div className="flex-1 overflow-y-auto space-y-1 mb-6">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-2 px-1">History</p>
            {conversations.length === 0 ? (
              <p className="text-white/30 text-xs px-1 py-4 text-center">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  className="w-full text-left px-3 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm truncate"
                >
                  {conv.title}
                </button>
              ))
            )}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-1">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm">
              <Settings size={16} />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0] bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-[#64748b] hover:text-[#0c1f4a] transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
            <span className="font-semibold text-[#0c1f4a] text-sm">Guidance Journey</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[#f1f5f9] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#0c1f4a] flex items-center justify-center text-white text-sm font-semibold">
                {userInitial}
              </div>
              <span className="text-sm text-[#0c1f4a] font-medium hidden sm:block">{userName}</span>
              <ChevronDown size={14} className="text-[#94a3b8]" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#e2e8f0] rounded-xl shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-[#e2e8f0]">
                  <p className="text-xs font-semibold text-[#0c1f4a]">{userName}</p>
                  <p className="text-xs text-[#94a3b8] truncate">{session?.data?.user?.email}</p>
                </div>
                <button
                  onClick={() => { setUserMenuOpen(false); handleLogout() }}
                  className="w-full text-left px-4 py-2 text-sm text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0c1f4a] flex items-center gap-2 transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#0c1f4a] flex items-center justify-center mb-6 shadow-md">
                <BrainCircuit size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#0c1f4a] mb-3">
                How can I help you today?
              </h2>
              <p className="text-[#64748b] max-w-md mb-10 text-sm leading-relaxed">
                I&apos;m your personal AI advisor at LMUI. Ask me anything about programs, career paths, admissions, or scholarships.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus() }}
                    className="text-left px-4 py-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0c1f4a] hover:border-[#1a3461] hover:bg-[#dbeafe]/30 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
              {messages.map((msg, idx) => {
                const text = getMessageText(msg.content)
                return (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                      ${msg.role === 'user' ? 'bg-[#0c1f4a] text-white' : 'bg-[#dbeafe] text-[#1a3461]'}`}>
                      {msg.role === 'user' ? userInitial : <BrainCircuit size={14} />}
                    </div>
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                      ${msg.role === 'user'
                        ? 'bg-[#0c1f4a] text-white rounded-tr-sm'
                        : 'bg-[#f1f5f9] text-[#0c1f4a] rounded-tl-sm border border-[#e2e8f0]'
                      }`}>
                      {text}
                    </div>
                  </div>
                )
              })}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#dbeafe] flex items-center justify-center">
                    <BrainCircuit size={14} className="text-[#1a3461]" />
                  </div>
                  <div className="bg-[#f1f5f9] border border-[#e2e8f0] px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-[#0c1f4a]/40 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[#e2e8f0] bg-white px-4 py-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-3 focus-within:border-[#1a3461] focus-within:ring-2 focus-within:ring-[#1a3461]/10 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about programs, careers, admissions…"
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent resize-none text-sm text-[#0c1f4a] placeholder-[#94a3b8] focus:outline-none max-h-40 leading-relaxed"
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                {isLoading ? (
                  <button
                    onClick={() => stop()}
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0c1f4a]/10 hover:bg-[#0c1f4a]/20 transition-colors"
                  >
                    <Square size={14} className="text-[#0c1f4a]" />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0c1f4a] hover:bg-[#1a3461] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={15} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-center text-[10px] text-[#c0ccd8] mt-2">
              Intelligente can make mistakes. Important decisions should be verified with an academic advisor.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

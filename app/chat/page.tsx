'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import Link from 'next/link'
import {
  BrainCircuit,
  Plus,
  Send,
  Square,
  Menu,
  X,
  Sparkles,
  CheckCircle,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  User,
  Settings,
  LogOut,
  MessageCircle,
  History,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type PipelineStage = 'idle' | 'extracting' | 'matching' | 'roadmap' | 'done' | 'error'

interface PastSession {
  id: string
  status: string
  started_at: string
}

// ── Thin loader — reads URL params, fetches session history if continuing ────

export default function ChatPage() {
  const [ready, setReady] = useState(false)
  const [initMessages, setInitMessages] = useState<any[]>([])
  const [preloadedSessionId, setPreloadedSessionId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sid = params.get('session_id')
    if (sid) {
      fetch(`/api/session?session_id=${sid}`)
        .then((r) => r.json())
        .then(({ messages, session_id }) => {
          setInitMessages(messages ?? [])
          setPreloadedSessionId(session_id ?? sid)
          setReady(true)
        })
        .catch(() => setReady(true))
    } else {
      setReady(true)
    }
  }, [])

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#0c1f4a] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <ChatInner
      key={preloadedSessionId ?? 'new'}
      initialMessages={initMessages}
      preloadedSessionId={preloadedSessionId}
    />
  )
}

// ── Main chat UI ─────────────────────────────────────────────────────────────

function ChatInner({
  initialMessages,
  preloadedSessionId,
}: {
  initialMessages: any[]
  preloadedSessionId: string | null
}) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [input, setInput] = useState('')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userInitial, setUserInitial] = useState('U')
  const [profileReady, setProfileReady] = useState(
    // If continuing a session, check if any init message contains <<PROFILE_READY>>
    initialMessages.some((m) => m.role === 'assistant' && m.content?.includes('<<PROFILE_READY>>'))
  )
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle')
  const [pipelineError, setPipelineError] = useState('')
  const [pastSessions, setPastSessions] = useState<PastSession[]>([])
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [prevTraitProfile, setPrevTraitProfile] = useState<any>(null)
  const prevTraitProfileIdRef = useRef<string | null>(null)
  // Session ID: use the preloaded one (continuing) or will be set after first message
  const sessionIdRef = useRef<string | null>(preloadedSessionId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const avatarDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    if (avatarOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [avatarOpen])

  const fetchSessions = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('conversation_sessions')
      .select('id, status, started_at')
      .order('started_at', { ascending: false })
      .limit(20)
    if (data) setPastSessions(data)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Student'
      setUserName(name)
      setUserEmail(user.email ?? '')
      setUserInitial(name.charAt(0).toUpperCase())

      // Load latest trait profile for continuation mode
      const { data: prevProfile } = await supabase
        .from('trait_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (prevProfile) {
        setPrevTraitProfile(prevProfile)
        prevTraitProfileIdRef.current = prevProfile.id
      }
    })
    fetchSessions()
  }, [router, fetchSessions])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const { messages, sendMessage, status, stop } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/conversation',
      fetch: async (url, options) => {
        // Create a session on the first message if we don't have one yet
        if (!sessionIdRef.current) {
          try {
            const res = await fetch('/api/session', { method: 'POST' })
            const { session_id } = await res.json()
            sessionIdRef.current = session_id
          } catch {
            // proceed without session saving
          }
        }

        const traitId = prevTraitProfileIdRef.current
        let fullUrl = url as string
        if (traitId) fullUrl += `?trait_profile_id=${traitId}`
        if (sessionIdRef.current) {
          fullUrl += traitId
            ? `&session_id=${sessionIdRef.current}`
            : `?session_id=${sessionIdRef.current}`
        }
        return fetch(fullUrl, options)
      },
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'
  const isPipelineRunning = pipelineStage !== 'idle' && pipelineStage !== 'done' && pipelineStage !== 'error'

  const getRawMessageText = (msg: any): string => {
    if (msg.parts && Array.isArray(msg.parts)) {
      return msg.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text ?? '').join('')
    }
    if (typeof msg.content === 'string') return msg.content
    if (Array.isArray(msg.content)) {
      return msg.content.filter((p: any) => p.type === 'text').map((p: any) => p.text ?? '').join('')
    }
    return ''
  }

  const getMessageText = (msg: any): string =>
    getRawMessageText(msg).replace(/<<PROFILE_READY>>/g, '').trim()

  // Scan ALL assistant messages — token may not be in the last one if student replied after
  useEffect(() => {
    if (profileReady || pipelineStage === 'done') return
    const found = messages.some(
      (msg) => msg.role === 'assistant' && getRawMessageText(msg).includes('<<PROFILE_READY>>')
    )
    if (found) setProfileReady(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading || isPipelineRunning) return
    const text = input
    setInput('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sendMessage as any)({ role: 'user', parts: [{ type: 'text', text }] })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const runPipeline = async () => {
    if (isPipelineRunning) return
    setPipelineError('')
    try {
      setPipelineStage('extracting')
      const extractRes = await fetch('/api/extract-traits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })
      if (!extractRes.ok) throw new Error('Trait extraction failed')
      const { trait_profile, trait_profile_id } = await extractRes.json()

      setPipelineStage('matching')
      const matchRes = await fetch('/api/match-career', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trait_profile, trait_profile_id }),
      })
      if (!matchRes.ok) throw new Error('Career matching failed')
      const { matches, recommendation, primary_institution, degree_field } = await matchRes.json()

      setPipelineStage('roadmap')
      const primaryMatch = matches?.find((m: any) => m.is_primary) ?? matches?.[0]
      const primaryMatchWithField = { ...primaryMatch, degree_field: degree_field ?? primaryMatch?.career_name }
      const roadmapRes = await fetch('/api/build-roadmap', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primary_match: primaryMatchWithField, primary_institution, recommendation_id: recommendation.id }),
      })
      if (!roadmapRes.ok) throw new Error('Roadmap generation failed')

      setPipelineStage('done')
      await fetchSessions()
    } catch (err: any) {
      setPipelineError(err.message || 'Something went wrong. Please try again.')
      setPipelineStage('error')
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const pipelineLabelMap: Record<string, string> = {
    extracting: 'Building your trait profile…',
    matching: 'Matching you to programmes and careers…',
    roadmap: 'Creating your personalised roadmap…',
  }

  const formatDate = (iso: string) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  if (!userName) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#0c1f4a] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  const isContinuingSession = preloadedSessionId !== null && initialMessages.length > 0

  return (
    <div className="flex h-screen bg-white overflow-hidden">

      {/* ── Sidebar overlay backdrop (mobile only) ─────────────────────── */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className={`
        fixed lg:relative top-0 left-0 h-full z-50
        w-72 lg:w-64 flex-shrink-0 bg-[#0c1f4a] flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">

          {/* Logo row */}
          <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                <BrainCircuit size={14} className="text-white" />
              </div>
              <span className="font-bold text-white">Intelligente</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="text-white/40 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden p-3">

            {/* New conversation */}
            <Link
              href="/chat"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm mb-3"
            >
              <Plus size={16} />
              New Conversation
            </Link>

            {/* Returning student banner */}
            {prevTraitProfile && !isContinuingSession && (
              <div className="mb-3 rounded-lg bg-white/5 border border-white/10 px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <History size={13} className="text-[#93c5fd] flex-shrink-0" />
                  <span className="text-xs font-semibold text-white/80">Returning Student</span>
                  {prevTraitProfile.profile_type && (
                    <span className="ml-auto flex-shrink-0 px-1.5 py-0.5 rounded-full bg-white/10 text-[9px] font-bold text-white/60 uppercase tracking-wide">
                      {prevTraitProfile.profile_type}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Your previous profile context will be included in this conversation.
                </p>
              </div>
            )}

            {/* Continuing session banner */}
            {isContinuingSession && (
              <div className="mb-3 rounded-lg bg-blue-500/10 border border-blue-400/20 px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle size={13} className="text-[#93c5fd] flex-shrink-0" />
                  <span className="text-xs font-semibold text-white/80">Continuing Session</span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  {initialMessages.length} messages loaded. Continue where you left off.
                </p>
              </div>
            )}

            {/* Pipeline / profile area */}
            {pipelineStage === 'done' ? (
              <div className="mb-3 rounded-lg bg-emerald-500/20 border border-emerald-400/30 p-3">
                <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold mb-1.5">
                  <CheckCircle size={15} />
                  Profile Generated!
                </div>
                <p className="text-white/60 text-xs mb-2.5">Your results are ready on your dashboard.</p>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-white text-[#0c1f4a] font-semibold text-xs hover:bg-blue-50 transition-colors"
                >
                  <LayoutDashboard size={13} />
                  View Dashboard
                </Link>
              </div>
            ) : pipelineStage === 'error' ? (
              <div className="mb-3 rounded-lg bg-red-500/20 border border-red-400/30 p-3">
                <p className="text-red-300 text-xs mb-2">{pipelineError}</p>
                <button onClick={runPipeline} className="w-full px-3 py-1.5 rounded-lg bg-white text-[#0c1f4a] text-xs font-semibold hover:bg-blue-50 transition-colors">
                  Try Again
                </button>
              </div>
            ) : isPipelineRunning ? (
              <div className="mb-3 rounded-lg border border-white/10 p-3">
                <div className="flex items-center gap-2 text-white/80 text-xs mb-2">
                  <Loader2 size={13} className="animate-spin" />
                  {pipelineLabelMap[pipelineStage]}
                </div>
                <div className="flex gap-1">
                  {(['extracting', 'matching', 'roadmap'] as const).map((stage, i) => (
                    <div key={stage} className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                      pipelineStage === stage ? 'bg-white'
                      : ['extracting', 'matching', 'roadmap'].indexOf(pipelineStage) > i ? 'bg-white/40'
                      : 'bg-white/10'
                    }`} />
                  ))}
                </div>
              </div>
            ) : profileReady ? (
              <button
                onClick={runPipeline}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-white text-[#0c1f4a] font-semibold text-sm mb-3 hover:bg-blue-50 transition-colors shadow-sm"
              >
                <Sparkles size={15} className="text-[#2563eb]" />
                Generate My Profile
              </button>
            ) : null}

            {/* Past sessions */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2 px-1">Previous Sessions</p>
              {pastSessions.length === 0 ? (
                <p className="text-white/30 text-xs px-1 py-3 text-center leading-relaxed">
                  Completed sessions<br />will appear here
                </p>
              ) : (
                <div className="space-y-0.5">
                  {pastSessions.map((s, idx) => {
                    const sessionNum = pastSessions.length - idx
                    const time = new Date(s.started_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    return (
                      <Link
                        key={s.id}
                        href={`/chat?session_id=${s.id}`}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors group ${
                          s.id === preloadedSessionId
                            ? 'bg-white/15 text-white'
                            : 'text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MessageSquare size={12} className="flex-shrink-0 opacity-50" />
                          <span className="text-xs truncate">Session #{sessionNum}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          <span className="text-[10px] text-white/30">{formatDate(s.started_at)} {time}</span>
                          {s.status === 'completed' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Back to dashboard */}
            <div className="border-t border-white/10 pt-3 mt-3">
              <Link
                href="/dashboard"
                onClick={() => setSidebarOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors text-sm"
              >
                <LayoutDashboard size={15} />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0] bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-[#64748b] hover:text-[#0c1f4a] transition-colors">
              <Menu size={20} />
            </button>
            <span className="font-semibold text-[#0c1f4a] text-sm">
              {isContinuingSession ? 'Continuing Session' : 'Discovery Conversation'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {profileReady && pipelineStage === 'idle' && (
              <button
                onClick={runPipeline}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0c1f4a] text-white text-sm font-medium hover:bg-[#1a3461] transition-colors"
              >
                <Sparkles size={14} />
                Generate My Profile
              </button>
            )}

            {/* Avatar with dropdown */}
            <div className="relative" ref={avatarDropdownRef}>
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="w-8 h-8 rounded-full bg-[#0c1f4a] hover:bg-[#1a3461] flex items-center justify-center text-white text-sm font-semibold transition-colors"
                aria-label="Account menu"
              >
                {userInitial}
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-10 z-50 w-52 bg-white rounded-xl shadow-xl border border-[#e2e8f0] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#f1f5f9]">
                      <p className="text-sm font-semibold text-[#0c1f4a] truncate">{userName}</p>
                      <p className="text-xs text-[#94a3b8] truncate">{userEmail}</p>
                    </div>
                    <div className="py-1.5">
                      <Link href="/dashboard" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors">
                        <LayoutDashboard size={14} className="text-[#64748b]" />
                        Dashboard
                      </Link>
                      <Link href="/dashboard/profile" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors">
                        <User size={14} className="text-[#64748b]" />
                        My Profile
                      </Link>
                      <Link href="/dashboard/my-conversations" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors">
                        <MessageCircle size={14} className="text-[#64748b]" />
                        My Conversations
                      </Link>
                      <Link href="/dashboard/settings" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors">
                        <Settings size={14} className="text-[#64748b]" />
                        Settings
                      </Link>
                    </div>
                    <div className="border-t border-[#f1f5f9] py-1.5">
                      <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
              )}
            </div>
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
                Hey {userName.split(' ')[0]}. Let&apos;s talk about your future.
              </h2>
              <p className="text-[#64748b] max-w-md text-sm leading-relaxed">
                I&apos;m going to ask you a few questions, not a test, just a conversation. There are no right or wrong answers. Just talk to me.
              </p>
              <p className="text-[#94a3b8] text-xs mt-4">Type a message below when you&apos;re ready to begin.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
              {messages.map((msg, idx) => {
                const text = getMessageText(msg)
                if (!text) return null
                return (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${msg.role === 'user' ? 'bg-[#0c1f4a] text-white' : 'bg-[#dbeafe] text-[#1a3461]'}`}>
                      {msg.role === 'user' ? userInitial : <BrainCircuit size={14} />}
                    </div>
                    <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#0c1f4a] text-white rounded-tr-sm' : 'bg-[#f1f5f9] text-[#0c1f4a] rounded-tl-sm border border-[#e2e8f0]'}`}>
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
                        <div key={i} className="w-2 h-2 rounded-full bg-[#0c1f4a]/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
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
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
                }}
                onKeyDown={handleKeyDown}
                placeholder={isContinuingSession ? 'Continue the conversation…' : 'Share whatever comes to mind…'}
                rows={1}
                disabled={isLoading || isPipelineRunning}
                className="flex-1 bg-transparent resize-none text-sm text-[#0c1f4a] placeholder-[#94a3b8] focus:outline-none max-h-40 leading-relaxed"
              />
              <div className="flex items-center flex-shrink-0">
                {isLoading ? (
                  <button onClick={() => stop()} className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0c1f4a]/10 hover:bg-[#0c1f4a]/20 transition-colors">
                    <Square size={14} className="text-[#0c1f4a]" />
                  </button>
                ) : (
                  <button onClick={handleSend} disabled={!input.trim() || isPipelineRunning} className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0c1f4a] hover:bg-[#1a3461] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <Send size={15} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-center text-[10px] text-[#c0ccd8] mt-2">
              Everything you share stays private. No scores, no judgement. Just a conversation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

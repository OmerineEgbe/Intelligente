'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-client'
import { ChevronDown, LogOut, Plus, Settings } from 'lucide-react'
import Link from 'next/link'

interface School {
  id: string
  name: string
  description: string
}

interface Department {
  id: string
  schoolid: string
  name: string
  description: string
}

interface Program {
  id: string
  departmentid: string
  name: string
  level: string
  description: string
}

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'schools' | 'departments' | 'programs' | 'careers'>('schools')
  const [schools, setSchools] = useState<School[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch data
    setLoading(false)
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push('/sign-in')
  }

  const handleDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-surface sticky top-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Intelligente Admin</h1>
          <p className="text-sm text-muted-foreground">Manage academic programs and career paths</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDashboard}
            className="px-4 py-2 rounded-lg bg-surface-secondary hover:bg-border text-foreground font-medium transition-colors text-sm"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground hover:bg-surface-secondary transition-colors text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          {(['schools', 'departments', 'programs', 'careers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm transition-colors capitalize ${
                activeTab === tab
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'schools' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Schools</h2>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-secondary text-accent-foreground font-medium transition-colors">
                  <Plus size={18} />
                  Add School
                </button>
              </div>
              <div className="bg-surface border border-border rounded-lg p-6">
                <p className="text-muted-foreground">
                  {loading ? 'Loading schools...' : 'Schools from the database will appear here'}
                </p>
                {/* Schools list will be rendered here */}
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Departments</h2>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-secondary text-accent-foreground font-medium transition-colors">
                  <Plus size={18} />
                  Add Department
                </button>
              </div>
              <div className="bg-surface border border-border rounded-lg p-6">
                <p className="text-muted-foreground">
                  {loading ? 'Loading departments...' : 'Departments from the database will appear here'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'programs' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Degree Programs</h2>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-secondary text-accent-foreground font-medium transition-colors">
                  <Plus size={18} />
                  Add Program
                </button>
              </div>
              <div className="bg-surface border border-border rounded-lg p-6">
                <p className="text-muted-foreground">
                  {loading ? 'Loading programs...' : 'Degree programs from the database will appear here'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'careers' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Career Paths</h2>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-secondary text-accent-foreground font-medium transition-colors">
                  <Plus size={18} />
                  Add Career Path
                </button>
              </div>
              <div className="bg-surface border border-border rounded-lg p-6">
                <p className="text-muted-foreground">
                  {loading ? 'Loading career paths...' : 'Career paths from the database will appear here'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

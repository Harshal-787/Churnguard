'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { api, clearSession, currentUser } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Activity, BarChart3, Boxes, Database, Gauge, Home, LogOut, Menu, Search, Settings2, ShieldCheck, Users, X, ChevronLeft, ChevronRight, TrendingDown, Bell } from 'lucide-react'

type ShellProps = { children: React.ReactNode }

const links = [
  { path: '/dashboard', label: 'Overview', icon: Home },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/performance', label: 'Model performance', icon: Gauge },
  { path: '/feed', label: 'Data feed', icon: Database },
]

export function AppShell({ children }: ShellProps) {
  const [open, setOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [statusData, setStatusData] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const route = usePathname() || '/'
  const router = useRouter()
  const user = currentUser()
  
  // Role-based access control
  const role = user?.role || 'Viewer'
  const isSuperAdmin = role === 'Super Admin'
  const isOrgAdmin = role === 'Org Admin' || isSuperAdmin
  const isAnalyst = role === 'Data Analyst' || isOrgAdmin
  const isAdmin = isSuperAdmin
  
  const allowedLinks = links.filter(l => {
    if (l.path === '/analytics' || l.path === '/performance' || l.path === '/feed') {
      return isAnalyst
    }
    return true
  })

  const handleSignOut = () => { clearSession(); router.push('/login') }
  
  useEffect(() => {
    // Fetch live model status summary
    api<any>('/dashboard/stats').then(res => {
      if (res.data) setStatusData(res.data)
    })
    api<any[]>('/notifications').then(res => {
      if (res.data) setNotifications(res.data)
    })
  }, [])
  return <div className="min-h-screen bg-background text-foreground lg:flex">
    <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar py-6 transition-all duration-300 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'w-20 px-3' : 'w-72 px-5'}`}>
      <div className={`flex items-center ${isCollapsed ? 'justify-center relative h-8' : 'justify-between'} px-2`}>
        {!isCollapsed && <div className="flex items-center gap-2 text-sidebar-foreground">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary drop-shadow-sm shrink-0">
            <path d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M3 9.5L16 17M29 9.5L16 17M16 30V17" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
            <circle cx="16" cy="17" r="3" fill="currentColor"/>
          </svg>
          <span className="font-extrabold tracking-tighter text-xl ml-1">
            <span className="text-foreground">Churn</span><span className="text-primary">Guard</span>
          </span>
        </div>}
        {isCollapsed && (
          <button onClick={() => setIsCollapsed(false)} title="Expand sidebar" className="mx-auto rounded-xl outline-none hover:scale-110 transition-transform active:scale-95">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary drop-shadow-sm shrink-0">
              <path d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M3 9.5L16 17M29 9.5L16 17M16 30V17" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="16" cy="17" r="3" fill="currentColor"/>
            </svg>
          </button>
        )}
        {!isCollapsed && (
          <button onClick={() => setIsCollapsed(true)} className="hidden lg:grid size-7 place-items-center rounded-lg text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
            <ChevronLeft className="size-4" />
          </button>
        )}
        <button onClick={() => setOpen(false)} className="lg:hidden p-1 rounded-lg text-sidebar-foreground/50"><X className="size-5" /></button>
      </div>
      {!isCollapsed && <div className="mt-10 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45">Workspace</div>}
      <nav className={`mt-6 flex flex-col gap-1 ${isCollapsed ? 'items-center' : ''}`}>
        {allowedLinks.map(({ path, label, icon: Icon }) => (
          <Link key={path} href={path} onClick={() => setOpen(false)} title={isCollapsed ? label : undefined} className={`flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition ${isCollapsed ? 'justify-center px-0 w-10 h-10' : 'px-3'} ${route === path || (path === '/customers' && route.startsWith('/customers/')) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}>
            <Icon className="size-5 shrink-0" />
            {!isCollapsed && label}
          </Link>
        ))}
        {isAdmin && (
          <Link href="/admin" onClick={() => setOpen(false)} title={isCollapsed ? 'Admin console' : undefined} className={`flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition ${isCollapsed ? 'justify-center px-0 w-10 h-10 mt-2' : 'px-3 mt-2'} ${route === '/admin' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70'}`}>
            <ShieldCheck className="size-5 shrink-0" />
            {!isCollapsed && 'Admin console'}
          </Link>
        )}
      </nav>
      
      {!isCollapsed && (
        <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Boxes className="size-4 text-sidebar-primary" />
            <span className="text-xs font-semibold">Model status</span>
          </div>
          {statusData && statusData.totalCustomers > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-sidebar-foreground/60">Retention Rate</span>
                <span className="font-medium text-primary">{statusData.retentionRate}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sidebar-foreground/60">At Risk</span>
                <span className="font-medium text-destructive">{statusData.atRisk} accounts</span>
              </div>
            </div>
          ) : (
            <p className="text-xs leading-5 text-sidebar-foreground/60">Connect your data source to view live model health and retention signals.</p>
          )}
        </div>
      )}
      <button onClick={handleSignOut} title={isCollapsed ? 'Sign out' : undefined} className={`mt-4 flex items-center gap-3 rounded-xl py-2.5 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent transition ${isCollapsed ? 'justify-center mx-auto w-10 px-0' : 'px-3'}`}>
        <LogOut className="size-5 shrink-0" />
        {!isCollapsed && 'Sign out'}
      </button>
    </aside>
    {open && <button aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-foreground/20 lg:hidden" />}
    <div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur md:px-8"><div className="flex items-center gap-3"><button onClick={() => setOpen(true)} className="rounded-lg border border-border p-2 lg:hidden" aria-label="Open navigation"><Menu className="size-4" /></button><div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex"><span>Workspace</span><span>/</span><span className="font-medium text-foreground">{links.find((l) => l.path === route)?.label || (route === '/admin' ? 'Admin console' : 'Customer profile')}</span></div></div><div className="flex items-center gap-3"><button className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground sm:flex"><Search className="size-3.5" />Search <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">⌘ K</kbd></button>
    
    <div className="relative">
      <button onClick={() => setShowNotifications(!showNotifications)} className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Notifications">
        <Bell className="size-4" />
        {notifications.some(n => !n.is_read) && <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive border border-background"></span>}
      </button>
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-lg flex flex-col gap-3 z-50">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">Alerts & Notifications</h3>
            {notifications.some(n => !n.is_read) && (
              <button onClick={() => {
                api('/notifications/mark-all-read', { method: 'POST' }).then(() => {
                  setNotifications(notifications.map(n => ({ ...n, is_read: true })))
                })
              }} className="text-xs text-primary hover:underline">Mark all read</button>
            )}
          </div>
          <div className="flex flex-col gap-2 max-h-96 overflow-auto">
            {notifications.length ? notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => {
                  if (!n.is_read) {
                    api(`/notifications/${n.id}/read`, { method: 'PATCH' }).then(() => {
                      setNotifications(notifications.map(x => x.id === n.id ? { ...x, is_read: true } : x))
                    })
                  }
                }}
                className={`flex flex-col gap-1 rounded-lg p-3 text-sm border cursor-pointer transition-colors ${n.is_read ? 'bg-muted/30 border-border/50 opacity-70 hover:bg-muted/50' : 'bg-primary/5 border-primary/20 hover:bg-primary/10'}`}
              >
                <span className={`font-semibold ${n.type === 'warning' ? 'text-amber-500' : n.type === 'success' ? 'text-emerald-500' : ''}`}>{n.title}</span>
                <span className="text-muted-foreground text-xs leading-relaxed">{n.message}</span>
                <span className="text-[10px] text-muted-foreground/60 mt-1">{new Date(n.created_at).toLocaleString()}</span>
              </div>
            )) : <div className="text-xs text-muted-foreground py-4 text-center">No notifications</div>}
          </div>
        </div>
      )}
    </div>
    
    <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Settings"><Settings2 className="size-4" /></button><div className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{(user?.name || user?.email || 'U').slice(0,1).toUpperCase()}</div></div></header><main className="mx-auto max-w-[1600px] p-4 md:p-8">{children}</main></div>
  </div>
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) { return <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div>{eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>}<h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>{action}</div> }

'use client'

import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { Search, Monitor, Moon, Sun, Settings, LogOut, Users, Activity, Home, Building2, UserCircle, Boxes, Loader2, Gauge, Database, ShieldCheck } from 'lucide-react'
import { useTheme } from 'next-themes'
import { api, currentUser } from '@/lib/api'

interface CommandPaletteProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOpenSettings: () => void
}

interface SearchResults {
  customers: any[]
  users: any[]
  organizations: any[]
  models: any[]
}

export function CommandPalette({ open, setOpen, onOpenSettings }: CommandPaletteProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResults>({
    customers: [],
    users: [],
    organizations: [],
    models: []
  })
  


  // Debounced search API call
  useEffect(() => {
    if (!search.trim()) {
      setResults({ customers: [], users: [], organizations: [], models: [] })
      return
    }
    
    const timeoutId = setTimeout(() => {
      setLoading(true)
      api<SearchResults>(`/search?q=${encodeURIComponent(search)}`)
        .then(res => {
          if (res.data) setResults(res.data)
        })
        .finally(() => setLoading(false))
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [search])

  const user = currentUser()
  const role = user?.role || 'Viewer'
  const isAnalyst = role === 'Data Analyst' || role === 'Org Admin' || role === 'Super Admin'
  const isSuperAdmin = role === 'Super Admin'

  const lcSearch = search.toLowerCase()
  const match = (text: string) => text.toLowerCase().includes(lcSearch)

  const showDashboard = match("dashboard")
  const showAnalytics = match("analytics") && isAnalyst
  const showCustomers = match("customers")
  const showPerformance = match("model performance") && isAnalyst
  const showFeed = match("data feed") && isAnalyst
  const showAdmin = match("admin console") && isSuperAdmin
  const showSettings = match("open settings")
  const showTheme = match("toggle dark mode") || match("toggle light mode")

  const hasStatic = showDashboard || showAnalytics || showCustomers || showPerformance || showFeed || showAdmin || showSettings || showTheme

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
          onClick={() => setOpen(false)} 
        />
      )}
      <Command.Dialog 
        shouldFilter={false}
        open={open} 
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="fixed left-1/2 top-[20vh] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 outline-none"
      >
        <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
          <Search className="mr-2 size-4 shrink-0 opacity-50" />
          <Command.Input 
            autoFocus
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..." 
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {loading && <Loader2 className="mr-2 size-4 shrink-0 animate-spin opacity-50" />}
        </div>
        
        <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
          {!hasStatic && results.customers.length === 0 && results.users.length === 0 && results.organizations.length === 0 && results.models.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {loading ? 'Searching...' : 'No results found.'}
            </div>
          )}
          
          {results.customers.length > 0 && (
            <Command.Group heading="Customers" className="px-2 py-1.5 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-semibold">
              {results.customers.map(c => (
                <Command.Item 
                  key={`cust-${c.id}`}
                  onSelect={() => { router.push(`/customers/${c.customer_id}`); setOpen(false) }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Users className="mr-2 size-4" />
                  <span>{c.customer_id}</span>
                  {c.geography && <span className="ml-2 text-xs opacity-50">{c.geography}</span>}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {results.users.length > 0 && (
            <Command.Group heading="Users" className="px-2 py-1.5 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-semibold">
              {results.users.map(u => (
                <Command.Item 
                  key={`user-${u.id}`}
                  onSelect={() => { setOpen(false) }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <UserCircle className="mr-2 size-4" />
                  <span>{u.full_name}</span>
                  <span className="ml-2 text-xs opacity-50">{u.email}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {results.models.length > 0 && (
            <Command.Group heading="Models" className="px-2 py-1.5 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-semibold">
              {results.models.map(m => (
                <Command.Item 
                  key={`model-${m.id}`}
                  onSelect={() => { router.push('/performance'); setOpen(false) }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Boxes className="mr-2 size-4" />
                  <span>{m.name}</span>
                  <span className="ml-2 text-xs opacity-50">v{m.version}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {results.organizations.length > 0 && (
            <Command.Group heading="Organizations" className="px-2 py-1.5 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-semibold">
              {results.organizations.map(o => (
                <Command.Item 
                  key={`org-${o.id}`}
                  onSelect={() => { setOpen(false) }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Building2 className="mr-2 size-4" />
                  <span>{o.name}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
          
          {(showDashboard || showAnalytics || showCustomers || showPerformance || showFeed || showAdmin) && (
            <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-semibold">
              {showDashboard && (
                <Command.Item 
                  onSelect={() => { router.push('/dashboard'); setOpen(false) }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50"
                >
                  <Home className="mr-2 size-4" />
                  <span>Dashboard</span>
                </Command.Item>
              )}
              {showCustomers && (
                <Command.Item 
                  onSelect={() => { router.push('/customers'); setOpen(false) }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50"
                >
                  <Users className="mr-2 size-4" />
                  <span>Customers</span>
                </Command.Item>
              )}
              {showAnalytics && (
                <Command.Item 
                  onSelect={() => { router.push('/analytics'); setOpen(false) }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50"
                >
                  <Activity className="mr-2 size-4" />
                  <span>Analytics</span>
                </Command.Item>
              )}
              {showPerformance && (
                <Command.Item 
                  onSelect={() => { router.push('/performance'); setOpen(false) }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50"
                >
                  <Gauge className="mr-2 size-4" />
                  <span>Model Performance</span>
                </Command.Item>
              )}
              {showFeed && (
                <Command.Item 
                  onSelect={() => { router.push('/feed'); setOpen(false) }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50"
                >
                  <Database className="mr-2 size-4" />
                  <span>Data Feed</span>
                </Command.Item>
              )}
              {showAdmin && (
                <Command.Item 
                  onSelect={() => { router.push('/admin'); setOpen(false) }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50"
                >
                  <ShieldCheck className="mr-2 size-4" />
                  <span>Admin Console</span>
                </Command.Item>
              )}
            </Command.Group>
          )}

          {(showDashboard || showAnalytics || showCustomers || showPerformance || showFeed || showAdmin) && (showSettings || showTheme) && (
            <Command.Separator className="-mx-1 h-px bg-border my-1" />
          )}

          {(showSettings || showTheme) && (
            <Command.Group heading="Settings & Appearance" className="px-2 py-1.5 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-semibold">
              {showSettings && (
                <Command.Item 
                  onSelect={() => { onOpenSettings(); setOpen(false) }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50"
                >
                  <Settings className="mr-2 size-4" />
                  <span>Open Settings</span>
                  <kbd className="ml-auto text-xs tracking-widest opacity-60 font-sans">⌘S</kbd>
                </Command.Item>
              )}
              {showTheme && (
                <Command.Item 
                  onSelect={() => { 
                    setTheme(theme === 'dark' ? 'light' : 'dark')
                    setOpen(false) 
                  }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50"
                >
                  {theme === 'dark' ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
                  <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                </Command.Item>
              )}
            </Command.Group>
          )}
      </Command.List>
    </Command.Dialog>
    </>
  )
}

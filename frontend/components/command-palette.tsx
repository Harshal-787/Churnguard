'use client'

import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { Search, Monitor, Moon, Sun, Settings, LogOut, Users, Activity, Home } from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  setOpen: (open: boolean) => void
  onOpenSettings: () => void
}

export function CommandPalette({ open, setOpen, onOpenSettings }: CommandPaletteProps) {
  const router = useRouter()
  
  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  return (
    <Command.Dialog 
      open={open} 
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-background/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
          <Search className="mr-2 size-4 shrink-0 opacity-50" />
          <Command.Input 
            autoFocus
            placeholder="Type a command or search..." 
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
          <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
          
          <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-semibold">
            <Command.Item 
              onSelect={() => { router.push('/dashboard'); setOpen(false) }}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <Home className="mr-2 size-4" />
              <span>Dashboard</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => { router.push('/analytics'); setOpen(false) }}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <Activity className="mr-2 size-4" />
              <span>Analytics</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => { router.push('/customers'); setOpen(false) }}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <Users className="mr-2 size-4" />
              <span>Customers</span>
            </Command.Item>
          </Command.Group>

          <Command.Separator className="-mx-1 h-px bg-border my-1" />

          <Command.Group heading="Settings & Appearance" className="px-2 py-1.5 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-semibold">
            <Command.Item 
              onSelect={() => { onOpenSettings(); setOpen(false) }}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <Settings className="mr-2 size-4" />
              <span>Open Settings</span>
              <kbd className="ml-auto text-xs tracking-widest opacity-60 font-sans">⌘S</kbd>
            </Command.Item>
            <Command.Item 
              onSelect={() => { /* Toggle dark mode */ }}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <Moon className="mr-2 size-4" />
              <span>Toggle Dark Mode</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  )
}

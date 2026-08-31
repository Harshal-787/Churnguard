'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, ArrowLeft, LockKeyhole, TrendingDown } from 'lucide-react'
import { api, saveSession } from '@/lib/api'
import { Button } from '@/components/shared/ui'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() { 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  
  const submit = async (e: FormEvent) => { 
    e.preventDefault()
    setBusy(true)
    setError('')
    
    // Convert to FastAPI endpoint format
    // FastAPI oauth2 expects form data: username and password
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)

    const result = await api<any>('/auth/login', { 
      method: 'POST', 
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form.toString()
    })
    
    setBusy(false)
    if (result.error) return setError(result.error)
    
    const token = result.data?.access_token || result.data?.token
    if (token) {
      // Fetch the full user profile including role
      const meResult = await api<any>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      saveSession(token, meResult.data || result.data)
      router.push('/dashboard')
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block border-r border-border/40">
        <Image src="/bg-auth.png" alt="Abstract Background" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-background/5" />
        <div className="absolute inset-0 p-12 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary drop-shadow-xl shrink-0">
              <path d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M3 9.5L16 17M29 9.5L16 17M16 30V17" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="16" cy="17" r="3" fill="currentColor"/>
            </svg>
            <span className="font-extrabold tracking-tighter text-2xl ml-1">
              <span className="text-foreground">Churn</span><span className="text-primary">Guard</span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center bg-background p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Back to home
          </Link>
          <div className="mb-10 flex items-center gap-2 lg:hidden">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary drop-shadow-sm shrink-0">
              <path d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M3 9.5L16 17M29 9.5L16 17M16 30V17" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="16" cy="17" r="3" fill="currentColor"/>
            </svg>
            <span className="font-extrabold tracking-tighter text-xl ml-1">
              <span className="text-foreground">Churn</span><span className="text-primary">Guard</span>
            </span>
          </div>
          <p className="mb-3 text-sm font-semibold text-primary">Welcome back</p>
          <h2 className="text-3xl font-semibold tracking-tight">Sign in to your workspace</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Continue to your customer intelligence workspace.</p>
          
          <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-sm font-medium">Email
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl border border-input bg-card px-3 py-3 outline-none focus:ring-2 focus:ring-ring" placeholder="you@company.com" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">Password
              <input required minLength={4} type="password" value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl border border-input bg-card px-3 py-3 outline-none focus:ring-2 focus:ring-ring" placeholder="••••••••" />
            </label>
            {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            
            <Button type="submit" disabled={busy}>{busy ? 'Connecting…' : 'Sign in'}<ArrowRight className="size-4" /></Button>
          </form>
          
          <p className="mt-6 text-center text-sm text-muted-foreground">New to ChurnGuard? <Link href="/register" className="font-semibold text-primary hover:underline">Create an account</Link></p>
          <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" />Your credentials stay protected</div>
        </div>
      </div>
    </main>
  )
}

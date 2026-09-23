'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, ArrowLeft, LockKeyhole, TrendingDown } from 'lucide-react'
import { api, saveSession } from '@/lib/api'
import { Button } from '@/components/shared/ui'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatedCube } from '@/components/landing/animated-cube'

export default function LoginPage() { 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [requires2FA, setRequires2FA] = useState(false)
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
    
    if (result.data?.requires_2fa) {
      setRequires2FA(true)
      return
    }
    
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

  const submitOTP = async (e: FormEvent) => { 
    e.preventDefault()
    setBusy(true)
    setError('')
    
    const result = await api<any>('/auth/verify-2fa', { 
      method: 'POST', 
      body: JSON.stringify({ email, otp })
    })
    
    setBusy(false)
    if (result.error) return setError(result.error)
    
    const token = result.data?.access_token || result.data?.token
    if (token) {
      const meResult = await api<any>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      saveSession(token, meResult.data || result.data)
      router.push('/dashboard')
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col border-r border-border/40 overflow-hidden bg-gradient-to-br from-[#050a15] via-[#0a1229] to-[#050a15]">
        {/* Subtle glowing orb behind the cube */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-60 pointer-events-none">
          <div className="w-[500px] h-[500px]">
            <AnimatedCube forceWhite={true} />
          </div>
        </div>
        
        {/* Subtle grid lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute h-px bg-white/10"
              style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
            />
          ))}
          {[...Array(12)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute w-px bg-white/10"
              style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
            />
          ))}
        </div>
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <div className="flex items-center gap-2">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary drop-shadow-xl shrink-0">
              <path d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M3 9.5L16 17M29 9.5L16 17M16 30V17" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="16" cy="17" r="3" fill="currentColor"/>
            </svg>
            <span className="font-extrabold tracking-tighter text-2xl ml-1">
              <span className="text-white">Churn</span><span className="text-primary">Guard</span>
            </span>
          </div>

          <div className="mt-auto pb-4">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/80 backdrop-blur-md mb-3 shadow-xl">
              <span className="flex size-1.5 rounded-full bg-primary mr-2 animate-pulse"></span>
              Enterprise Intelligence
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2 drop-shadow-sm">
              Predict. Prevent.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Retain.</span>
            </h1>
            <p className="text-sm text-white/60 max-w-sm font-medium">
              Join the world's most proactive revenue teams turning customer data into actionable retention plays.
            </p>
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
          <p className="mb-3 text-sm font-semibold text-primary slide-up-fade">{requires2FA ? 'Two-Factor Authentication' : 'Welcome back'}</p>
          <h2 className="text-3xl font-semibold tracking-tight slide-up-fade animate-stagger-1">{requires2FA ? 'Enter your code' : 'Sign in to your workspace'}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground slide-up-fade animate-stagger-2">{requires2FA ? `We sent a 6-digit code to ${email}.` : 'Continue to your customer intelligence workspace.'}</p>
          
          {requires2FA ? (
            <form onSubmit={submitOTP} className="mt-8 flex flex-col gap-5 slide-up-fade animate-stagger-3">
              <label className="flex flex-col gap-2 text-sm font-medium">Authentication Code
                <input required minLength={6} maxLength={6} type="text" value={otp} onChange={e => setOtp(e.target.value)} className="rounded-xl border border-border/50 bg-muted/30 px-3 py-3 outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm text-center tracking-[0.5em] font-mono text-lg" placeholder="••••••" />
              </label>
              {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={busy} className="bg-primary text-white hover:bg-primary/90 font-semibold shadow-sm transition-colors h-12 rounded-xl mt-2 premium-hover">{busy ? 'Verifying…' : 'Verify Code'}<ArrowRight className="size-4 ml-1" /></Button>
              <button type="button" onClick={() => { setRequires2FA(false); setOtp(''); setError(''); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-2">Back to login</button>
            </form>
          ) : (
            <form onSubmit={submit} className="mt-8 flex flex-col gap-5 slide-up-fade animate-stagger-3">
              <label className="flex flex-col gap-2 text-sm font-medium">Email
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl border border-border/50 bg-muted/30 px-3 py-3 outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm" placeholder="you@company.com" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">Password
                <input required minLength={4} type="password" value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl border border-border/50 bg-muted/30 px-3 py-3 outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm" placeholder="••••••••" />
              </label>
              {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
              
              <Button type="submit" disabled={busy} className="bg-primary text-white hover:bg-primary/90 font-semibold shadow-sm transition-colors h-12 rounded-xl mt-2 premium-hover">{busy ? 'Connecting…' : 'Sign in'}<ArrowRight className="size-4 ml-1" /></Button>
            </form>
          )}
          
          {!requires2FA && <p className="mt-6 text-center text-sm text-muted-foreground slide-up-fade animate-stagger-4">New to ChurnGuard? <Link href="/register" className="font-semibold text-primary hover:underline">Create an account</Link></p>}
          <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground slide-up-fade animate-stagger-5"><LockKeyhole className="size-3.5" />Your credentials stay protected</div>
        </div>
      </div>
    </main>
  )
}

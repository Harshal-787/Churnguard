'use client'

import { FormEvent, useState, useRef } from 'react'
import { ArrowRight, ArrowLeft, LockKeyhole, ImagePlus } from 'lucide-react'
import { api, saveSession } from '@/lib/api'
import { Button } from '@/components/shared/ui'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatedCube } from '@/components/landing/animated-cube'

export default function RegisterPage() { 
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [organization, setOrganization] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Data Analyst')
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfilePicture(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }
  
  const submit = async (e: FormEvent) => { 
    e.preventDefault()
    setBusy(true)
    setError('')
    
    // Register the user using FormData
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('full_name', `${firstName} ${lastName}`.trim())
    formData.append('organization_name', organization)
    formData.append('role', role)
    if (profilePicture) formData.append('profile_picture', profilePicture)
    
    const result = await api<any>('/auth/register', { 
      method: 'POST', 
      headers: {}, // Do not set Content-Type, let fetch auto-set it for FormData
      body: formData
    })
    
    if (result.error) {
      setBusy(false)
      return setError(result.error)
    }

    // Auto-login after registration
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)

    const loginResult = await api<any>('/auth/login', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    })

    setBusy(false)
    if (loginResult.error) return setError(loginResult.error)
    
    const token = loginResult.data?.access_token || loginResult.data?.token
    if (token) {
      // Fetch the full user profile including role
      const meResult = await api<any>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      saveSession(token, meResult.data || loginResult.data)
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
              Join the Network
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2 drop-shadow-sm">
              Stop guessing.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Start retaining.</span>
            </h1>
            <p className="text-sm text-white/60 max-w-sm font-medium">
              Create your intelligence workspace and discover the real drivers behind your customer churn.
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
          <p className="mb-3 text-sm font-semibold text-primary slide-up-fade">Get Started</p>
          <h2 className="text-3xl font-semibold tracking-tight slide-up-fade animate-stagger-1">Create your workspace</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground slide-up-fade animate-stagger-2">Set up your account to start monitoring retention.</p>
          
          <form onSubmit={submit} className="mt-8 flex flex-col gap-4 slide-up-fade animate-stagger-3">
            <div className="flex flex-col items-center mb-2">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="relative flex items-center justify-center size-24 rounded-full border-2 border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 transition overflow-hidden group"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImagePlus className="size-6" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Photo</span>
                  </div>
                )}
                {previewUrl && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                    Change
                  </div>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium">First name
                <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="rounded-xl border border-border/50 bg-muted/30 px-3 py-3 outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm" placeholder="Alex" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">Last name
                <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="rounded-xl border border-border/50 bg-muted/30 px-3 py-3 outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm" placeholder="Chen" />
              </label>
            </div>
            
            <label className="flex flex-col gap-2 text-sm font-medium">Organization
              <input required type="text" value={organization} onChange={e => setOrganization(e.target.value)} className="rounded-xl border border-border/50 bg-muted/30 px-3 py-3 outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm" placeholder="Acme Corp" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">Email
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl border border-border/50 bg-muted/30 px-3 py-3 outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm" placeholder="you@company.com" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">Password
              <input required minLength={4} type="password" value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl border border-border/50 bg-muted/30 px-3 py-3 outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm" placeholder="••••••••" />
            </label>
            {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            
            <Button type="submit" disabled={busy} className="bg-primary text-white hover:bg-primary/90 font-semibold shadow-sm transition-colors h-12 rounded-xl mt-2 premium-hover">{busy ? 'Setting up…' : 'Create account'}<ArrowRight className="size-4 ml-1" /></Button>
          </form>
          
          <p className="mt-6 text-center text-sm text-muted-foreground slide-up-fade animate-stagger-4">Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link></p>
          <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground slide-up-fade animate-stagger-5"><LockKeyhole className="size-3.5" />Your credentials stay protected</div>
        </div>
      </div>
    </main>
  )
}

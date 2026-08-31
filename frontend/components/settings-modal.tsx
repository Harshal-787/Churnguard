'use client'

import { useState, useEffect } from 'react'
import { X, User, Bell, Palette, Shield, Key, Database, Download, CheckCircle2, Cpu } from 'lucide-react'
import { Button } from './shared/ui'
import { currentUser, api } from '@/lib/api'

interface SettingsModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  role: string
}

export function SettingsModal({ open, setOpen, role }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('general')
  const [savedMessage, setSavedMessage] = useState('')
  const user = currentUser()
  
  // States for preferences (legitimate working functionality via localStorage)
  const [timeRange, setTimeRange] = useState('Last 30 Days')
  const [strictShap, setStrictShap] = useState(true)
  const [exportFormat, setExportFormat] = useState('CSV')
  const [models, setModels] = useState<any[]>([])
  const [activeModel, setActiveModel] = useState<string>('')
  const [isModelsLoading, setIsModelsLoading] = useState(false)

  // Load saved preferences on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTimeRange = localStorage.getItem('cg_pref_time_range')
      const savedStrictShap = localStorage.getItem('cg_pref_strict_shap')
      const savedExportFmt = localStorage.getItem('cg_pref_export_format')
      if (savedTimeRange) setTimeRange(savedTimeRange)
      if (savedStrictShap !== null) setStrictShap(savedStrictShap === 'true')
      if (savedExportFmt) setExportFormat(savedExportFmt)
    }
  }, [open])

  useEffect(() => {
    if (activeTab === 'ml') {
      fetchModels()
    }
  }, [activeTab])

  const fetchModels = async () => {
    try {
      setIsModelsLoading(true)
      const res = await api<any>('/models')
      if (res.status === 200 && res.data) {
        setModels(res.data.models || [])
        setActiveModel(res.data.active_model || '')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsModelsLoading(false)
    }
  }

  const handleSetModel = async (modelFilename: string) => {
    try {
      setSavedMessage('Saving model and reanalyzing data...')
      const res = await api<any>('/models/active', {
        method: 'POST',
        body: JSON.stringify({ model_filename: modelFilename })
      })
      if (res.status === 200) {
        setActiveModel(modelFilename)
        
        // Auto-reanalyze and reload the window so the whole app syncs!
        await api('/predict/batch/reanalyze', { method: 'POST' })
        
        setSavedMessage('Data reanalyzed successfully!')
        window.dispatchEvent(new Event('cg_stats_updated'))
        setTimeout(() => {
          setSavedMessage('')
          window.location.reload()
        }, 1500)
      }
    } catch (e) {
      console.error(e)
      setSavedMessage('')
    }
  }

  if (!open) return null

  // Define tabs based on role
  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  if (['Data Analyst', 'Org Admin', 'Super Admin'].includes(role)) {
    tabs.push({ id: 'ml', label: 'Machine Learning', icon: Cpu })
    tabs.push({ id: 'preferences', label: 'Data Preferences', icon: Database })
    tabs.push({ id: 'export', label: 'Export Settings', icon: Download })
  }

  if (['Org Admin', 'Super Admin'].includes(role)) {
    tabs.push({ id: 'security', label: 'Security & Access', icon: Shield })
    tabs.push({ id: 'api', label: 'API Keys', icon: Key })
  }
  
  const handleSavePref = (key: string, value: string) => {
    localStorage.setItem(key, value)
    setSavedMessage('Settings saved successfully!')
    setTimeout(() => setSavedMessage(''), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-md transition-all">
      <div className="flex h-[85vh] w-[90vw] max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Shield className="size-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Application Settings</h2>
              <p className="text-xs text-muted-foreground">Manage your workspace preferences</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {savedMessage && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 animate-in fade-in zoom-in slide-in-from-right-4">
                <CheckCircle2 className="size-3.5" />
                {savedMessage}
              </span>
            )}
            <button onClick={() => setOpen(false)} className="rounded-full bg-muted/50 p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X className="size-4" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-border/50 bg-muted/10 p-4 flex flex-col gap-1 overflow-y-auto">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary shadow-md shadow-primary/20 text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  <Icon className={`size-4 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {tab.label}
                </button>
              )
            })}
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 lg:p-10 bg-background/50">
            <div className="max-w-2xl">
              
              {activeTab === 'general' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="border-b border-border/50 pb-4">
                    <h3 className="text-xl font-semibold tracking-tight">Profile Information</h3>
                    <p className="text-sm text-muted-foreground mt-1">Manage your personal information and contact details.</p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="size-20 rounded-full border border-border bg-muted overflow-hidden shrink-0 shadow-inner">
                      {user?.profile_picture_url ? (
                        <img src={`http://localhost:8000${user.profile_picture_url}`} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-2xl font-semibold text-muted-foreground">
                          {(user?.full_name || user?.name || user?.email || 'U').slice(0,1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{user?.full_name || user?.name || 'Unknown User'}</h4>
                      <p className="text-sm text-muted-foreground">{role} • {user?.organization_name || 'Organization'}</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-5">
                    <label className="text-sm font-medium text-foreground">Display Name
                      <input type="text" className="mt-1.5 flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm" defaultValue={user?.full_name || user?.name || ''} />
                    </label>
                    <label className="text-sm font-medium text-foreground">Email Address
                      <input type="email" disabled className="mt-1.5 flex h-11 w-full rounded-xl border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed shadow-inner" defaultValue={user?.email || ''} />
                    </label>
                  </div>
                  <Button className="rounded-xl px-8 h-11 shadow-sm">Save Profile Changes</Button>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="border-b border-border/50 pb-4">
                    <h3 className="text-xl font-semibold tracking-tight">Theme Preferences</h3>
                    <p className="text-sm text-muted-foreground mt-1">Customize how the application looks on your device.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-primary bg-primary/5 p-5 shadow-sm transition-all hover:bg-primary/10">
                      <div className="size-10 rounded-full bg-slate-950 border border-slate-800 shadow-md group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-foreground">Dark Mode</span>
                    </button>
                    <button className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-muted/50 p-5 hover:bg-muted transition-all">
                      <div className="size-10 rounded-full bg-white border border-slate-200 shadow-sm group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-muted-foreground">Light Mode</span>
                    </button>
                    <button className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-muted/50 p-5 hover:bg-muted transition-all">
                      <div className="size-10 rounded-full bg-gradient-to-tr from-slate-900 to-white border shadow-sm group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-muted-foreground">System Default</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="border-b border-border/50 pb-4">
                    <h3 className="text-xl font-semibold tracking-tight">Data Preferences</h3>
                    <p className="text-sm text-muted-foreground mt-1">Advanced settings for Data Analysts. These settings persist across sessions.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-5 shadow-sm transition-colors hover:bg-muted/20">
                      <div>
                        <p className="font-medium text-foreground">Default Time Range</p>
                        <p className="text-sm text-muted-foreground mt-0.5">The default range shown on analytics charts.</p>
                      </div>
                      <select 
                        value={timeRange}
                        onChange={(e) => {
                          setTimeRange(e.target.value)
                          handleSavePref('cg_pref_time_range', e.target.value)
                        }}
                        className="rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        <option value="Last 7 Days">Last 7 Days</option>
                        <option value="Last 30 Days">Last 30 Days</option>
                        <option value="Last 90 Days">Last 90 Days</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-5 shadow-sm transition-colors hover:bg-muted/20">
                      <div>
                        <p className="font-medium text-foreground">Strict SHAP Interpretations</p>
                        <p className="text-sm text-muted-foreground mt-0.5">Enforce high-confidence thresholds for feature importance.</p>
                      </div>
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={strictShap}
                          onChange={(e) => {
                            setStrictShap(e.target.checked)
                            handleSavePref('cg_pref_strict_shap', String(e.target.checked))
                          }}
                          className="peer sr-only" 
                          id="strict-shap"
                        />
                        <label 
                          htmlFor="strict-shap"
                          className="block h-6 w-11 cursor-pointer rounded-full bg-muted transition-colors peer-checked:bg-primary"
                        >
                          <div className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform ${strictShap ? 'translate-x-5' : 'translate-x-0'}`} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'export' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="border-b border-border/50 pb-4">
                    <h3 className="text-xl font-semibold tracking-tight">Export Settings</h3>
                    <p className="text-sm text-muted-foreground mt-1">Configure default formats for data downloads.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-5 shadow-sm transition-colors hover:bg-muted/20">
                      <div>
                        <p className="font-medium text-foreground">Default Export Format</p>
                        <p className="text-sm text-muted-foreground mt-0.5">Format used when downloading reports and customer lists.</p>
                      </div>
                      <select 
                        value={exportFormat}
                        onChange={(e) => {
                          setExportFormat(e.target.value)
                          handleSavePref('cg_pref_export_format', e.target.value)
                        }}
                        className="rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        <option value="CSV">CSV (Spreadsheet)</option>
                        <option value="JSON">JSON (Developer)</option>
                        <option value="PDF">PDF (Report)</option>
                      </select>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-xl h-11 border-dashed">
                    <Download className="mr-2 size-4" /> Download Example Report ({exportFormat})
                  </Button>
                </div>
              )}

              {activeTab === 'ml' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="border-b border-border/50 pb-4">
                    <h3 className="text-xl font-semibold tracking-tight">Machine Learning Models</h3>
                    <p className="text-sm text-muted-foreground mt-1">Hot-swap the active global prediction model for your organization.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start justify-between rounded-xl border border-border/50 bg-card/50 p-5 shadow-sm transition-colors hover:bg-muted/20">
                      <div className="flex-1 pr-6">
                        <p className="font-medium text-foreground">Active Model Engine</p>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                          Select the backend artifact to use for all inference requests. Changes apply instantly with zero downtime.
                        </p>
                        
                        {isModelsLoading ? (
                          <div className="h-10 w-full animate-pulse rounded-lg bg-muted/50" />
                        ) : (
                          <div className="relative">
                            <select 
                              value={activeModel}
                              onChange={(e) => setActiveModel(e.target.value)}
                              className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm font-medium shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              {models.map(model => (
                                <option key={model.filename} value={model.filename}>
                                  {model.name} ({(model.size_bytes / 1024 / 1024).toFixed(2)} MB)
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        )}
                        
                      </div>
                      <div className="shrink-0 pt-1">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                          <Cpu className="size-6" />
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={() => handleSetModel(activeModel)} className="w-full rounded-xl h-11 mt-2 shadow-sm">
                      <Cpu className="mr-2 size-4" /> Save Active Model
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="border-b border-border/50 pb-4">
                    <h3 className="text-xl font-semibold tracking-tight">Security & Access Policies</h3>
                    <p className="text-sm text-muted-foreground mt-1">Organization-wide security settings for administrators.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-5 shadow-sm transition-colors hover:bg-muted/20">
                      <div>
                        <p className="font-medium text-foreground">Require 2FA</p>
                        <p className="text-sm text-muted-foreground mt-0.5">Force all organization members to use two-factor auth.</p>
                      </div>
                      <div className="relative flex items-center">
                        <input type="checkbox" className="peer sr-only" id="req-2fa" />
                        <label htmlFor="req-2fa" className="block h-6 w-11 cursor-pointer rounded-full bg-muted transition-colors peer-checked:bg-primary">
                          <div className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-5 shadow-sm transition-colors hover:bg-muted/20">
                      <div>
                        <p className="font-medium text-foreground">Session Timeout</p>
                        <p className="text-sm text-muted-foreground mt-0.5">Automatically log users out after inactivity.</p>
                      </div>
                      <select className="rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary focus:outline-none">
                        <option>15 Minutes</option>
                        <option>1 Hour</option>
                        <option>4 Hours</option>
                        <option>Never</option>
                      </select>
                    </div>
                  </div>
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
                    <h4 className="text-sm font-semibold text-destructive mb-1">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground mb-4">This action will force all users to reset their password on their next login.</p>
                    <Button variant="destructive" className="rounded-lg shadow-sm">Force Rotate All Passwords</Button>
                  </div>
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300">
                  <div className="grid size-16 place-items-center rounded-full bg-muted mb-4">
                    <Bell className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Notification Preferences</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2">Configure how you want to receive alerts about churn risks and system events.</p>
                  <Button variant="outline" className="mt-6 rounded-xl shadow-sm">Enable Browser Push</Button>
                </div>
              )}
              
              {activeTab === 'api' && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300">
                  <div className="grid size-16 place-items-center rounded-full bg-muted mb-4">
                    <Key className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">API Keys</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2">Generate and manage API keys for programmatic access to the ChurnGuard engine.</p>
                  <Button className="mt-6 rounded-xl shadow-sm">Generate New Key</Button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

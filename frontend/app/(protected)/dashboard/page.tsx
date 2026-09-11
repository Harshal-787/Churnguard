'use client'

import { useEffect, useState } from 'react'
import { BarChart3, CheckCircle2, RefreshCw, ShieldAlert, TrendingDown, Users, ArrowRight, Database, Sparkles, ClipboardList, Send, Loader2, X } from 'lucide-react'
import { api, currentUser, displayValue, listFrom } from '@/lib/api'
import { PageHeader } from '@/components/app-shell'
import { Button, Card, Metric, State, Skeleton } from '@/components/shared/ui'
import Link from 'next/link'

type RecordData = Record<string, any>

import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell, XAxis, ComposedChart, Line } from 'recharts'
import { toast } from 'sonner'

function MiniBars({ values, forecast }: { values: number[], forecast?: number[] }) { 
  const data = values.map((v, i) => ({ name: `M${i + 1}`, churn: v as number | null, forecast: null as number | null }))
  if (forecast && forecast.length) {
    const lastM = values.length
    forecast.forEach((v, i) => data.push({ name: `M${lastM + i + 1}`, churn: null as any, forecast: v }))
    // Connect the line from the last actual point
    if (data.length > forecast.length) {
      data[lastM - 1].forecast = data[lastM - 1].churn
    }
  }

  return (
    <div className="h-40 w-full mt-auto pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} dy={5} />
          <Tooltip 
            cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
            contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }} 
            itemStyle={{ color: 'var(--primary)', fontWeight: 600 }} 
            labelStyle={{ color: 'var(--muted-foreground)', fontSize: '12px' }}
          />
          <Bar dataKey="churn" fill="url(#colorChurn)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          {forecast && forecast.length > 0 && (
            <Line type="monotone" dataKey="forecast" stroke="var(--destructive)" strokeDasharray="4 4" strokeWidth={2} dot={{r:3}} activeDot={{r:5}} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<RecordData | null>(null)
  const [team, setTeam] = useState<any[]>([])
  const [error, setError] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isReanalyzing, setIsReanalyzing] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  
  const [strategyData, setStrategyData] = useState<any>(null)
  const [isStrategyLoading, setIsStrategyLoading] = useState(false)
  const [strategyModalOpen, setStrategyModalOpen] = useState(false)
  const [strategyCustomer, setStrategyCustomer] = useState<any>(null)

  const user = currentUser()

  // Role booleans
  const role = user?.role || 'Viewer'
  const isSuperAdmin = role === 'Super Admin'
  const isOrgAdmin = role === 'Org Admin' || isSuperAdmin
  const isAnalyst = role === 'Data Analyst' || isOrgAdmin

  const load = async () => { 
    setIsRefreshing(true)
    // Uses FastAPI stats endpoint
    const r = await api<RecordData>('/dashboard/stats')
    setData(r.data || null)
    setError(r.error || '')

    const tr = await api<any[]>('/organizations/me/users')
    if (tr.data) setTeam(tr.data)
    setIsRefreshing(false)
  }

  const reanalyze = async () => {
    setIsReanalyzing(true)
    await api('/predict/batch/reanalyze', { method: 'POST' })
    // We don't load() here, we wait for the WebSocket event!
    toast.info("Reanalysis started in background. Dashboard will update automatically.")
  }
  
  useEffect(() => { 
    load() 
    
    // Connect WebSocket
    const orgId = currentUser()?.organization_id
    if (!orgId) return
    
    const ws = new WebSocket(`ws://localhost:8000/api/v1/ws/${orgId}`)
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'reanalyze_complete') {
          toast.success(`Reanalysis complete! Scored ${msg.count} customers.`)
          setIsReanalyzing(false)
          load()
        }
      } catch (e) {}
    }
    
    return () => {
      ws.close()
    }
  }, [])

  const fetchStrategy = async (c: any) => {
    setStrategyCustomer(c)
    setStrategyModalOpen(true)
    setIsStrategyLoading(true)
    setStrategyData(null)
    const r = await api(`/predict/strategy/${c.id || c.customer_id}`, { method: 'POST' })
    if (r.data) {
      setStrategyData(r.data)
    } else {
      toast.error(r.error || 'Failed to generate AI Strategy')
      setStrategyModalOpen(false)
    }
    setIsStrategyLoading(false)
  }

  const dispatchToJira = async (c: any) => {
    const id = toast.loading('Creating Jira ticket...')
    try {
      const r = await api(`/integrations/jira/${c.id || c.customer_id}`, { method: 'POST' })
      if (r.error) throw new Error(r.error)
      const responseData = r.data as any
      toast.success(`${responseData?.message}: ${responseData?.ticket_id}`, { id })
    } catch (err: any) {
      toast.error(err.message || 'Failed to create Jira ticket', { id })
    }
  }

  const dispatchToHubspot = async (c: any) => {
    const id = toast.loading('Triggering HubSpot workflow...')
    try {
      const r = await api(`/integrations/hubspot/${c.id || c.customer_id}`, { method: 'POST' })
      if (r.error) throw new Error(r.error)
      const responseData = r.data as any
      toast.success(`${responseData?.message}: ${responseData?.workflow_id}`, { id })
    } catch (err: any) {
      toast.error(err.message || 'Failed to trigger HubSpot workflow', { id })
    }
  }
  
  const metrics = data && (data.metrics || data)
  const trend = listFrom<number>(data?.monthly_churn || data?.churn_trend).map(Number).filter(Number.isFinite)
  const forecast = listFrom<number>(data?.forecast_churn).map(Number).filter(Number.isFinite)
  
  const firstName = user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'User'

  // Component logic for Priority Queue
  const PriorityQueueWidget = () => (
    <Card className="p-6 flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Priority queue</h2>
          <p className="mt-1 text-sm text-muted-foreground">Customers needing action</p>
        </div>
        <ShieldAlert className="size-5 text-destructive" />
      </div>
      {!data ? (
        <div className="flex flex-col gap-3 flex-1 overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-[76px] w-full rounded-xl" />
          ))}
        </div>
      ) : listFrom<RecordData>(data?.priority_customers).length ? (
        <div className="flex flex-col gap-3 flex-1 overflow-auto max-h-[400px] pr-2">
          {listFrom<RecordData>(data?.priority_customers).map((c,i)=> (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border p-3 text-left hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <Link href={`/customers/${c.id}`} className="flex flex-col gap-1 overflow-hidden flex-1">
                <span className="truncate text-sm font-semibold">{c.name || c.email || `Customer ${c.id}`}</span>
                <span className="text-[11px] font-mono text-muted-foreground">Bal: ${displayValue(c.balance ?? c.avg_balance)}</span>
              </Link>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-destructive">
                    {(c.score ?? c.risk_score ?? c.churn_probability) !== undefined && (c.score ?? c.risk_score ?? c.churn_probability) !== null ? ((c.score ?? c.risk_score ?? c.churn_probability) * 100).toFixed(1) + '%' : '—'}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk</span>
                </div>
                
                {/* CRM Actions */}
                <div className="flex items-center gap-2 mt-2 sm:mt-0 relative z-10">
                  <button 
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 transition-colors hover:bg-purple-500/20 cursor-pointer" 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); fetchStrategy(c); }}
                  >
                    <Sparkles className="size-3.5" /> 
                    AI Strategy
                  </button>
                  {isAnalyst && (
                    <>
                      <button 
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-500/20 cursor-pointer" 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); dispatchToJira(c); }}
                      >
                        <ClipboardList className="size-3.5" /> 
                        Jira
                      </button>
                      <button 
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 transition-colors hover:bg-orange-500/20 cursor-pointer" 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); dispatchToHubspot(c); }}
                      >
                        <Send className="size-3.5" /> 
                        HubSpot
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <State empty="No priority customers were returned." />
      )}
    </Card>
  )

  // Component logic for Team
  const OrgTeamWidget = () => (
    <Card className="p-6 flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Organization team</h2>
          <p className="mt-1 text-sm text-muted-foreground">Active workspace members</p>
        </div>
        <Users className="size-5 text-muted-foreground" />
      </div>
      {!data ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : team.length ? (
        <div className="flex flex-col gap-3">
          {team.map((member: any) => (
            <div key={member.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {(member.full_name || member.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{member.full_name || 'Team Member'}</p>
                <p className="truncate text-xs text-muted-foreground">{member.email}</p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <State empty="No organization members found." />
      )}
    </Card>
  )

  // Component logic for Churn Movement Chart
  const ChurnMovementWidget = () => (
    <Card className="p-6 h-full">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="font-semibold">Churn movement & forecast</h2>
          <p className="mt-1 text-sm text-muted-foreground">Historical signal vs predictive projection</p>
        </div>
        <BarChart3 className="size-5 text-muted-foreground" />
      </div>
      {!data ? (
        <Skeleton className="h-40 w-full rounded-lg mt-auto" />
      ) : error ? (
        <State error={error} onRetry={load} /> 
      ) : trend.length ? (
        <MiniBars values={trend} forecast={forecast} /> 
      ) : (
        <State empty="Connect the analytics endpoint to see churn movement." />
      )}
    </Card>
  )

  // Component logic for Data Analyst quick tools
  const DataOpsWidget = () => (
    <Card className="p-6 flex h-full flex-col items-center justify-center text-center bg-primary/5 border-primary/10">
      <Database className="size-8 text-primary mb-4" />
      <h2 className="font-semibold mb-2">Manage Data Pipelines</h2>
      <p className="text-sm text-muted-foreground mb-6">Upload new CSV datasets or monitor model ingestion.</p>
      <Link href="/feed">
        <Button>Open Data Feed</Button>
      </Link>
    </Card>
  )

  return (
    <>
      <PageHeader 
        eyebrow="Workspace overview" 
        title={`Welcome, ${firstName}!`} 
        description="A live view of customer health, risk movement, and the actions that need attention." 
        action={
          <div className="flex items-center gap-4">
            {successMsg && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-500 animate-in fade-in zoom-in slide-in-from-right-4">
                <CheckCircle2 className="size-4" />
                {successMsg}
              </span>
            )}
            <div className="flex gap-2">
              {isAnalyst && (
                <Button variant="outline" onClick={reanalyze} disabled={isReanalyzing || isRefreshing}>
                  <Database className={`mr-2 size-4 ${isReanalyzing ? 'animate-pulse text-primary' : ''}`} />
                  {isReanalyzing ? 'Reanalyzing...' : 'Reanalyze'}
                </Button>
              )}
              <Button variant="outline" onClick={load} disabled={isRefreshing || isReanalyzing}>
                <RefreshCw className={`mr-2 size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        } 
      />
      
      {/* 
        VIEWER LAYOUT 
        - Show 3 metrics only (No model confidence)
        - Show Priority Queue and Org Team side-by-side
      */}
      {!isAnalyst && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <Metric isLoading={!data} label="Customers monitored" value={displayValue(metrics?.total_customers)} note="From the connected data source" icon={Users} />
            <Metric isLoading={!data} label="At high risk" value={displayValue(metrics?.high_risk_customers)} note="Prioritize immediate outreach" icon={ShieldAlert} />
            <Metric isLoading={!data} label="Current churn rate" value={displayValue(metrics?.churn_rate, '%')} note="Based on returned model output" icon={TrendingDown} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2 items-stretch">
            <PriorityQueueWidget />
            <OrgTeamWidget />
          </div>
        </>
      )}

      {/* 
        ANALYST LAYOUT (Non-Admin)
        - Show all 4 metrics
        - Show Churn movement, Priority queue, Data Ops
      */}
      {isAnalyst && !isOrgAdmin && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
            <Metric isLoading={!data} label="Customers monitored" value={displayValue(metrics?.total_customers)} note="From the connected data source" icon={Users} />
            <Metric isLoading={!data} label="At high risk" value={displayValue(metrics?.high_risk_customers)} note="Prioritize immediate outreach" icon={ShieldAlert} />
            <Metric isLoading={!data} label="Current churn rate" value={displayValue(metrics?.churn_rate, '%')} note="Based on returned model output" icon={TrendingDown} />
            <Metric isLoading={!data} label="Model confidence" value={displayValue(metrics?.model_confidence, '%')} note="Latest available score" icon={CheckCircle2} />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1fr_.7fr_.7fr] items-stretch">
            <ChurnMovementWidget />
            <PriorityQueueWidget />
            <DataOpsWidget />
          </div>
        </>
      )}

      {/* 
        ADMIN LAYOUT 
        - Show all 4 metrics
        - Show Churn movement, Priority queue, Org Team
      */}
      {isOrgAdmin && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
            <Metric isLoading={!data} label="Customers monitored" value={displayValue(metrics?.total_customers)} note="From the connected data source" icon={Users} />
            <Metric isLoading={!data} label="At high risk" value={displayValue(metrics?.high_risk_customers)} note="Prioritize immediate outreach" icon={ShieldAlert} />
            <Metric isLoading={!data} label="Current churn rate" value={displayValue(metrics?.churn_rate, '%')} note="Based on returned model output" icon={TrendingDown} />
            <Metric isLoading={!data} label="Model confidence" value={displayValue(metrics?.model_confidence, '%')} note="Latest available score" icon={CheckCircle2} />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1fr_.7fr_.7fr] items-stretch">
            <ChurnMovementWidget />
            <PriorityQueueWidget />
            <OrgTeamWidget />
          </div>
        </>
      )}

      {strategyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-background p-6 shadow-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" /> 
                <h2 className="text-xl font-bold tracking-tight">AI Strategy: Customer {strategyCustomer?.name || strategyCustomer?.id || 'Customer'}</h2>
              </div>
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStrategyModalOpen(false); }} 
                className="rounded-full p-2 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            
            {isStrategyLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin mb-4 text-primary" />
                <p className="text-muted-foreground animate-pulse">Consulting LLM models...</p>
              </div>
            ) : strategyData ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-primary/10 p-5 border border-primary/20">
                  <h3 className="font-semibold text-foreground mb-2">Recommended Action Plan</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{strategyData.action_plan || strategyData.strategy}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/30 p-4 border border-border/50">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Key Risk Factor</span>
                    <p className="mt-1.5 font-medium text-sm">{strategyData.risk_factor || 'Unknown'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/30 p-4 border border-border/50">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Retention Probability</span>
                    <p className="mt-1.5 font-medium text-sm">
                      {strategyData.retention_prob ? displayValue(strategyData.retention_prob, '%') : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-red-500 font-medium">
                Failed to load AI strategy from the server.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

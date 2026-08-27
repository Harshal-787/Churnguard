'use client'

import { useEffect, useState } from 'react'
import { BarChart3, CheckCircle2, RefreshCw, ShieldAlert, TrendingDown, Users, ArrowRight, Database } from 'lucide-react'
import { api, currentUser, displayValue, listFrom } from '@/lib/api'
import { PageHeader } from '@/components/app-shell'
import { Button, Card, Metric, State } from '@/components/shared/ui'
import Link from 'next/link'

type RecordData = Record<string, any>

function MiniBars({ values }: { values: number[] }) { 
  const max = Math.max(...values, 1)
  return (
    <div className="flex h-32 items-end gap-2">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${Math.max(4, v / max * 100)}%` }} />
          <span className="text-[10px] text-muted-foreground">{i + 1}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<RecordData | null>(null)
  const [team, setTeam] = useState<any[]>([])
  const [error, setError] = useState('')
  const user = currentUser()

  // Role booleans
  const role = user?.role || 'Viewer'
  const isSuperAdmin = role === 'Super Admin'
  const isOrgAdmin = role === 'Org Admin' || isSuperAdmin
  const isAnalyst = role === 'Data Analyst' || isOrgAdmin

  const load = async () => { 
    // Uses FastAPI stats endpoint
    const r = await api<RecordData>('/dashboard/stats')
    setData(r.data || null)
    setError(r.error || '')

    const tr = await api<any[]>('/organizations/me/users')
    if (tr.data) setTeam(tr.data)
  }
  
  useEffect(() => { load() }, [])
  
  const metrics = data && (data.metrics || data)
  const trend = listFrom<number>(data?.monthly_churn || data?.churn_trend).map(Number).filter(Number.isFinite)
  
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
      {listFrom<RecordData>(data?.priority_customers).length ? (
        <div className="flex flex-col gap-3">
          {listFrom<RecordData>(data?.priority_customers).slice(0,5).map((c,i)=> (
            <Link key={i} href={`/customers/${c.id}`} className="flex items-center justify-between rounded-xl border border-border p-3 text-left hover:bg-muted">
              <span className="truncate text-sm font-medium">{c.name || c.email || `Customer ${c.id}`}</span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
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
      {team.length ? (
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
          <h2 className="font-semibold">Churn movement</h2>
          <p className="mt-1 text-sm text-muted-foreground">Monthly signal returned by your API</p>
        </div>
        <BarChart3 className="size-5 text-muted-foreground" />
      </div>
      {error ? <State error={error} onRetry={load} /> : trend.length ? <MiniBars values={trend} /> : <State empty="Connect the analytics endpoint to see churn movement." />}
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
        action={<Button variant="outline" onClick={load}><RefreshCw className="size-4" />Refresh</Button>} 
      />
      
      {/* 
        VIEWER LAYOUT 
        - Show 3 metrics only (No model confidence)
        - Show Priority Queue and Org Team side-by-side
      */}
      {!isAnalyst && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <Metric label="Customers monitored" value={displayValue(metrics?.total_customers)} note="From the connected data source" icon={Users} />
            <Metric label="At high risk" value={displayValue(metrics?.high_risk_customers)} note="Prioritize immediate outreach" icon={ShieldAlert} />
            <Metric label="Current churn rate" value={displayValue(metrics?.churn_rate, '%')} note="Based on returned model output" icon={TrendingDown} />
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
            <Metric label="Customers monitored" value={displayValue(metrics?.total_customers)} note="From the connected data source" icon={Users} />
            <Metric label="At high risk" value={displayValue(metrics?.high_risk_customers)} note="Prioritize immediate outreach" icon={ShieldAlert} />
            <Metric label="Current churn rate" value={displayValue(metrics?.churn_rate, '%')} note="Based on returned model output" icon={TrendingDown} />
            <Metric label="Model confidence" value={displayValue(metrics?.model_confidence, '%')} note="Latest available score" icon={CheckCircle2} />
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
            <Metric label="Customers monitored" value={displayValue(metrics?.total_customers)} note="From the connected data source" icon={Users} />
            <Metric label="At high risk" value={displayValue(metrics?.high_risk_customers)} note="Prioritize immediate outreach" icon={ShieldAlert} />
            <Metric label="Current churn rate" value={displayValue(metrics?.churn_rate, '%')} note="Based on returned model output" icon={TrendingDown} />
            <Metric label="Model confidence" value={displayValue(metrics?.model_confidence, '%')} note="Latest available score" icon={CheckCircle2} />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1fr_.7fr_.7fr] items-stretch">
            <ChurnMovementWidget />
            <PriorityQueueWidget />
            <OrgTeamWidget />
          </div>
        </>
      )}
    </>
  )
}

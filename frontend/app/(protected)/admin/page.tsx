'use client'

import { useEffect, useState } from 'react'
import { api, listFrom } from '@/lib/api'
import { PageHeader } from '@/components/app-shell'
import { Button, Card, State } from '@/components/shared/ui'
import { ShieldCheck, Users, Database, Activity, Trash2, ShieldAlert } from 'lucide-react'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  
  const fetchAll = async () => {
    const [statsRes, usersRes, logsRes] = await Promise.all([
      api<any>('/organizations/admin/stats'),
      api<any[]>('/organizations/me/users'),
      api<any[]>('/organizations/admin/audit_logs')
    ])
    if (statsRes.data) setStats(statsRes.data)
    if (usersRes.data) setUsers(usersRes.data)
    if (logsRes.data) setLogs(logsRes.data)
    setError(statsRes.error || usersRes.error || logsRes.error || '')
  }

  useEffect(() => { fetchAll() }, [])

  const deleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    setBusy(true)
    const res = await api(`/organizations/admin/users/${id}`, { method: 'DELETE' })
    if (res.error) alert(res.error)
    else await fetchAll()
    setBusy(false)
  }
  
  if (error) {
    return (
      <>
        <PageHeader eyebrow="Intelligence" title="Admin console" description="Manage organizations and inspect system-level workspace health." />
        <Card><State error={error} /></Card>
      </>
    )
  }

  if (!stats) {
    return (
      <>
        <PageHeader eyebrow="Intelligence" title="Admin console" description="Manage organizations and inspect system-level workspace health." />
        <Card className="p-6"><State empty="Loading admin dashboard..." /></Card>
      </>
    )
  }

  return (
    <>
      <PageHeader 
        eyebrow="Intelligence" 
        title="Admin console" 
        description="Manage organizations and inspect system-level workspace health." 
      />
      
      {/* TABS */}
      <div className="mb-6 flex space-x-2 border-b border-border">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'database', label: 'Database Load', icon: Database },
          { id: 'audit', label: 'Audit Logs', icon: ShieldCheck }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id)} 
            className={`flex items-center gap-2 border-b-2 px-4 py-3 -mb-px text-sm font-medium transition-colors ${activeTab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </div>
      
      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.systemStats?.map((s: any, i: number) => (
            <Card key={i} className="p-6">
              <p className="text-sm text-muted-foreground">{s.title}</p>
              <p className="mt-2 text-3xl font-bold">{s.value}</p>
            </Card>
          ))}
          <Card className="md:col-span-2 lg:col-span-4 p-6">
             <h2 className="font-semibold mb-4">Workspace Plans</h2>
             <div className="grid gap-4">
               {stats.organizations?.map((org: any, i: number) => (
                 <div key={i} className="flex items-center justify-between rounded-xl border border-border p-4">
                   <div>
                     <p className="font-medium">{org.name}</p>
                     <p className="text-xs text-muted-foreground">{org.users} users</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-semibold text-emerald-500">{org.status}</p>
                   </div>
                 </div>
               ))}
             </div>
          </Card>
        </div>
      )}

      {/* USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium">{u.full_name || 'N/A'}</td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4">
                      <span className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{u.role}</span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="danger" disabled={busy} onClick={() => deleteUser(u.id)} className="h-8 px-3 text-xs">
                        <Trash2 className="size-3 mr-2" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* DATABASE LOAD TAB */}
      {activeTab === 'database' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="font-semibold mb-6 flex items-center gap-2"><Database className="size-5" /> Storage Metrics</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Customers Stored</span>
                  <span className="font-medium">{stats.dbLoad?.customers || 0} / 50,000</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(((stats.dbLoad?.customers || 0)/50000)*100, 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Prediction Records</span>
                  <span className="font-medium">{stats.dbLoad?.predictions || 0} / 250,000</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(((stats.dbLoad?.predictions || 0)/250000)*100, 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Audit Logs Retained</span>
                  <span className="font-medium">{stats.dbLoad?.auditLogs || 0} / 10,000</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-destructive" style={{ width: `${Math.min(((stats.dbLoad?.auditLogs || 0)/10000)*100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="flex flex-col justify-center bg-sidebar p-8 text-sidebar-foreground">
            <ShieldAlert className="size-8 text-destructive mb-4" />
            <h3 className="text-lg font-semibold">Storage Warnings</h3>
            <p className="mt-2 text-sm text-sidebar-foreground/70">Your workspace is currently well within its Enterprise storage limits. No action is required. Additional storage can be provisioned automatically if API quotas are exceeded.</p>
          </Card>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Timestamp</th>
                  <th className="p-4 font-medium">User Email</th>
                  <th className="p-4 font-medium">Action</th>
                  <th className="p-4 font-medium">Endpoint</th>
                  <th className="p-4 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.length > 0 ? logs.map(l => (
                  <tr key={l.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 whitespace-nowrap text-muted-foreground text-xs">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="p-4 font-medium">{l.user_email}</td>
                    <td className="p-4 font-semibold text-primary">{l.action}</td>
                    <td className="p-4 text-xs font-mono">{l.endpoint}</td>
                    <td className="p-4 text-xs font-mono">{l.ip_address || 'Unknown'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No audit logs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  )
}

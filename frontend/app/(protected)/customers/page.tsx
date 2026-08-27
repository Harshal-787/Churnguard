'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Filter, RefreshCw, Search } from 'lucide-react'
import { api, displayValue, listFrom } from '@/lib/api'
import { PageHeader } from '@/components/app-shell'
import { Button, Card, State } from '@/components/shared/ui'
import Link from 'next/link'

type RecordData = Record<string, any>

export default function CustomersPage() {
  const [items, setItems] = useState<RecordData[]>([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  
  const load = async () => { 
    setLoading(true)
    const r = await api<unknown>('/customers')
    setItems(listFrom<RecordData>(r.data))
    setError(r.error || '')
    setLoading(false)
  }
  
  useEffect(() => { load() }, [])
  
  const filtered = useMemo(() => items.filter(c => JSON.stringify(c).toLowerCase().includes(query.toLowerCase())), [items, query])
  
  return (
    <>
      <PageHeader 
        eyebrow="Customer intelligence" 
        title="Customers" 
        description="Search and inspect the customer records returned by your connected API." 
        action={<Button variant="outline" onClick={load}><RefreshCw className="size-4" />Refresh</Button>} 
      />
      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder="Search customers" 
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" 
            />
          </div>
          <Button variant="ghost"><Filter className="size-4" />Filters</Button>
        </div>
        
        {loading ? (
          <State empty="Loading customer records…" />
        ) : error ? (
          <State error={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <State empty={query ? 'No customers match this search.' : 'No customers were returned by the API.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Risk score</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Last activity</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c,i)=> (
                  <tr key={c.id || i} className="border-t border-border hover:bg-muted/40">
                    <td className="px-5 py-4">
                      <p className="font-medium">{c.name || c.email || 'Unnamed customer'}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{c.email || displayValue(c.id)}</p>
                    </td>
                    <td className="px-5 py-4 font-mono">{displayValue(c.risk_score ?? c.churn_probability, '%')}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{c.status || c.risk_level || '—'}</span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{displayValue(c.last_activity || c.updated_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/customers/${c.id}`} className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
                        View <ArrowRight className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import { ArrowRight, Filter, RefreshCw, Search, Upload, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { api, displayValue } from '@/lib/api'
import { PageHeader } from '@/components/app-shell'
import { Button, Card, State } from '@/components/shared/ui'
import Link from 'next/link'

type RecordData = Record<string, any>

export default function CustomersPage() {
  const [items, setItems] = useState<RecordData[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Poll upload progress
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (uploading) {
      interval = setInterval(async () => {
        try {
          const res = await api<any>('/predict/batch/csv/progress')
          if (res.data) setUploadProgress(res.data)
        } catch (e) {}
      }, 500)
    }
    return () => clearInterval(interval)
  }, [uploading])
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedQuery !== query) {
        setDebouncedQuery(query)
        setPage(1) // Reset to page 1 on new search
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query, debouncedQuery])
  
  const load = async () => { 
    setLoading(true)
    const r = await api<any>(`/customers?page=${page}&limit=50&query=${encodeURIComponent(debouncedQuery)}`)
    if (r.data) {
      setItems(r.data.items || [])
      setTotal(r.data.total || 0)
    }
    setError(r.error || '')
    setLoading(false)
  }
  
  useEffect(() => { load() }, [page, debouncedQuery])
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await api('/predict/batch/csv', {
      method: 'POST',
      body: formData
    })
    
    setUploading(false)
    setUploadProgress({ current: 0, total: 0 })
    if (fileInputRef.current) fileInputRef.current.value = ''
    
    if (res.error) {
      alert(`Upload failed: ${res.error}`)
    } else {
      alert("Upload complete! All customers have been loaded.")
      load()
    }
  }
  
  return (
    <>
      <PageHeader 
        eyebrow="Customer intelligence" 
        title="Customers" 
        description="Search and inspect the customer records returned by your connected API." 
        action={
          <div className="flex gap-2">
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleUpload} />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Upload className="size-4 mr-2" />}
              {uploading ? (
                uploadProgress.total > 0 
                  ? `Uploading... (${uploadProgress.current.toLocaleString()} / ${uploadProgress.total.toLocaleString()})`
                  : 'Uploading...'
              ) : 'Upload CSV'}
            </Button>
            <Button variant="outline" onClick={load}><RefreshCw className="size-4 mr-2" />Refresh</Button>
          </div>
        } 
      />
      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder="Search customers by ID" 
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" 
            />
          </div>
          <Button variant="ghost"><Filter className="size-4 mr-2" />Filters</Button>
        </div>
        
        {loading ? (
          <State empty="Loading customer records…" />
        ) : error ? (
          <State error={error} onRetry={load} />
        ) : items.length === 0 ? (
          <State empty={query ? 'No customers match this search.' : 'No customers were returned by the API.'} />
        ) : (
          <div className="flex flex-col">
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
                  {items.map((c,i)=> (
                    <tr key={`${c.id}-${i}`} className="border-t border-border hover:bg-muted/40">
                      <td className="px-5 py-4">
                        <p className="font-medium">{c.name || c.email || c.customer_id || 'Unnamed customer'}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{c.email || displayValue(c.id)}</p>
                      </td>
                      <td className="px-5 py-4 font-mono">{c.riskScore ?? c.risk_score ?? c.churn_probability ? ((c.riskScore ?? c.risk_score ?? c.churn_probability) * 100).toFixed(2) + '%' : '—'}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{c.status || c.risk_level || c.risk_tier || '—'}</span>
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
            
            {/* Pagination Controls */}
            {total > 0 && (
              <div className="flex items-center justify-between border-t border-border p-4 bg-muted/20">
                <span className="text-sm text-muted-foreground font-medium">
                  Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, total)} of {total.toLocaleString()} records
                </span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                  >
                    <ChevronLeft className="size-4 mr-1" /> Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPage(p => p + 1)} 
                    disabled={page * 50 >= total}
                  >
                    Next <ChevronRight className="size-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </>
  )
}

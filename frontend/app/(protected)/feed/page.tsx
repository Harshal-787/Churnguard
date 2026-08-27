'use client'

import { useState } from 'react'
import { CloudUpload, Download, Upload, X } from 'lucide-react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/app-shell'
import { Button, Card, cn } from '@/components/shared/ui'

export default function FeedPage() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  
  const submit = async () => { 
    if (!file) return
    setBusy(true)
    const form = new FormData()
    form.append('file', file)
    
    // In FastAPI, usually it's /data/upload or /upload
    const r = await api('/predict/batch/csv', { method: 'POST', body: form })
    setMessage(r.error ? '' : 'Upload accepted by the API.')
    setError(r.error || '')
    setBusy(false)
  }
  
  return (
    <>
      <PageHeader 
        eyebrow="Data operations" 
        title="Data feed" 
        description="Upload source records, download the template, or manage the connected dataset." 
      />
      
      <div className="grid gap-6 lg:grid-cols-2 items-stretch">
        <Card className="flex h-full flex-col p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <CloudUpload className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Upload customer data</h2>
              <p className="text-sm text-muted-foreground">CSV files only. Validation happens server-side.</p>
            </div>
          </div>
          
          <label className="mt-8 flex flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/[.03] py-10 px-6 text-center hover:bg-primary/[.05] transition-colors">
            <Upload className="size-7 text-primary" />
            <span className="text-sm font-semibold">{file?.name || 'Choose a CSV file'}</span>
            <span className="text-xs text-muted-foreground">Drop a file here or browse</span>
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>
          
          {(message || error) && (
            <p className={cn('mt-4 rounded-xl p-3 text-sm', error ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary')}>
              {error || message}
            </p>
          )}
          
          <div className="mt-auto pt-5">
            <Button onClick={submit} disabled={!file || busy} className="w-full">
              {busy ? 'Uploading...' : 'Upload file'}
            </Button>
          </div>
        </Card>
        
        <Card className="flex h-full flex-col p-6">
          <div>
            <h2 className="font-semibold">Dataset tools</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use the API-backed tools below to keep source data consistent.</p>
          </div>
          
          <div className="mt-8 flex flex-1 flex-col justify-center gap-4">
            <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/data/template`} className="flex items-center justify-between rounded-xl border border-border p-4 text-sm font-medium hover:bg-muted transition-colors">
              Download CSV template <Download className="size-4" />
            </a>
            <Button variant="danger" className="w-full justify-between p-4 h-auto rounded-xl">
              <span className="flex items-center gap-2"><X className="size-4" />Wipe dataset</span>
            </Button>
          </div>
          
          <div className="mt-auto pt-4">
            <p className="text-xs leading-5 text-muted-foreground">Destructive actions require server authorization and should only be used when you intend to remove the connected dataset.</p>
          </div>
        </Card>
      </div>
    </>
  )
}

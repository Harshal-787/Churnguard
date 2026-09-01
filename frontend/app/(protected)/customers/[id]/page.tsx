'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { api, displayValue, listFrom } from '@/lib/api'
import { PageHeader } from '@/components/app-shell'
import { Card, State } from '@/components/shared/ui'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip, ResponsiveContainer } from 'recharts'

type RecordData = Record<string, any>

export default function CustomerDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<RecordData | null>(null)
  const [error, setError] = useState('')
  
  useEffect(() => { 
    api<RecordData>(`/customers/${id}`).then(r => { 
      setData(r.data || null)
      setError(r.error || '') 
    }) 
  }, [id])
  
  const shapFeatures = listFrom<RecordData>(data?.explanations || data?.shap_values || data?.features || data?.shapData)

  return (
    <>
      <Link href="/customers" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />Back to customers
      </Link>
      
      <PageHeader 
        eyebrow="Customer profile" 
        title={data?.name || data?.email || 'Customer detail'} 
        description="Risk profile, model explanation, and retention context from the source record." 
      />
      
      {error ? (
        <Card><State error={error} /></Card>
      ) : !data ? (
        <Card><State empty="Loading customer profile…" /></Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[.7fr_1.3fr]">
          <Card className="p-6">
            <h2 className="font-semibold">Risk assessment</h2>
            <div className="mt-8 flex items-end gap-3">
              <span className="font-mono text-6xl font-semibold">{data.risk_score ?? data.churn_probability ? ((data.risk_score ?? data.churn_probability) * 100).toFixed(2) + '%' : '—'}</span>
              <span className="mb-2 rounded-full bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">
                {data.risk_level || data.status || '—'}
              </span>
            </div>
            <div className="mt-8 flex flex-col gap-3 text-sm">
              {[
                ['Plan', data.plan], 
                ['Tenure', data.tenure], 
                ['Last activity', data.last_activity], 
                ['Account value', data.lifetime_value ? `$${Number(data.lifetime_value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '—']
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">{k}</span>
                  <strong>{displayValue(v)}</strong>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="font-semibold">Model explanation</h2>
            <p className="mt-1 text-sm text-muted-foreground">Factors driving this customer's risk prediction.</p>
            {shapFeatures.length ? (
              <div className="mt-6 h-80 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[...shapFeatures].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))} 
                    layout="vertical" 
                    margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" axisLine={false} tickLine={false} className="text-xs font-mono" />
                    <YAxis dataKey="feature" type="category" width={180} interval={0} axisLine={false} tickLine={false} className="text-xs font-mono" />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
                      formatter={(value: any, name: any, props: any) => {
                        const origValue = props.payload.value;
                        const direction = origValue > 0 ? '+ (Increases Risk)' : '- (Decreases Risk)';
                        return [`${Math.abs(origValue).toFixed(3)} ${direction}`, 'Impact'];
                      }}
                    />
                    <Bar dataKey="value" radius={4}>
                      {shapFeatures.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value > 0 ? 'var(--destructive)' : 'var(--chart-2)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <State empty="No explanation factors were returned for this customer." />
            )}
          </Card>
        </div>
      )}
    </>
  )
}

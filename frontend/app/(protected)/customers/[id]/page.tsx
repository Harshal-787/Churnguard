'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { api, displayValue, listFrom } from '@/lib/api'
import { PageHeader } from '@/components/app-shell'
import { Card, State } from '@/components/shared/ui'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type RecordData = Record<string, any>

const FEATURE_MAP: Record<string, string> = {
  'NumOfProducts': 'Number of Products',
  'Geography_Germany': 'Location (Germany)',
  'Geography_France': 'Location (France)',
  'Geography_Spain': 'Location (Spain)',
  'IsActiveMember': 'Membership Status',
  'Age': 'Customer Age',
  'Engagement_Score': 'Engagement Score',
  'Credit_Utilization_Proxy': 'Credit Utilization',
  'Balance_to_Salary_Ratio': 'Balance/Salary Ratio',
  'HasCrCard': 'Credit Card Status',
  'EstimatedSalary': 'Estimated Salary',
  'Tenure': 'Account Tenure',
  'Balance': 'Account Balance'
}

const formatFeatureName = (feature: string) => {
  return FEATURE_MAP[feature] || feature.replace(/_/g, ' ')
}

const getFeatureValue = (feature: string, data: RecordData) => {
  if (!data) return '—'
  if (feature === 'NumOfProducts') return data.plan || `${data.products} Products`
  if (feature === 'Age') return `${data.age} years`
  if (feature === 'IsActiveMember') return data.active ? 'Active' : 'Inactive'
  if (feature.startsWith('Geography')) return data.geography
  if (feature === 'Credit_Utilization_Proxy' || feature === 'Balance_to_Salary_Ratio' || feature === 'Engagement_Score') return 'Derived ML Metric'
  if (feature === 'Tenure') return data.tenure
  if (feature === 'EstimatedSalary') return data.salary
  if (feature === 'HasCrCard') return data.creditCard ? 'Yes' : 'No'
  if (feature === 'Balance') return `$${Number(data.balance).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
  return '—'
}

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
          <Card className="p-6 premium-hover slide-up-fade animate-stagger-1">
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
          
          <Card className="p-6 premium-hover slide-up-fade animate-stagger-2">
            <h2 className="font-semibold">Model explanation</h2>
            <p className="mt-1 text-sm text-muted-foreground">Factors driving this customer's risk prediction.</p>
            {shapFeatures.length ? (
              <div className="mt-6 flex flex-col gap-3">
                {[...shapFeatures]
                  .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
                  .map((entry, idx) => {
                    const isPositive = entry.value > 0;
                    const magnitude = Math.abs(entry.value);
                    
                    // Use max impact to calculate visual proportional background
                    const maxImpact = Math.max(...shapFeatures.map(f => Math.abs(f.value)));
                    const widthPct = Math.max(5, (magnitude / maxImpact) * 100) + "%";
                    
                    return (
                      <div key={idx} className="relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50">
                        {/* Background proportional bar */}
                        <div 
                          className={`absolute left-0 top-0 h-full opacity-[0.08] ${isPositive ? 'bg-destructive' : 'bg-emerald-500'}`}
                          style={{ width: widthPct }}
                        />
                        
                        <div className="relative flex items-center justify-between gap-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{formatFeatureName(entry.feature)}</span>
                            <span className="text-sm text-muted-foreground mt-0.5">
                              Current value: <strong className="text-foreground font-medium">{getFeatureValue(entry.feature, data)}</strong>
                            </span>
                          </div>
                          
                          <div className={`flex flex-col items-end gap-1 ${isPositive ? 'text-destructive' : 'text-emerald-500'}`}>
                            <div className="flex items-center gap-1.5 font-semibold">
                              {isPositive ? <TrendingUp className="size-4" strokeWidth={2.5} /> : <TrendingDown className="size-4" strokeWidth={2.5} />}
                              <span>{isPositive ? '+' : '-'}{magnitude.toFixed(2)} Impact</span>
                            </div>
                            <span className="text-xs font-medium opacity-80 uppercase tracking-wider">
                              {isPositive ? 'Increases Risk' : 'Decreases Risk'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                })}
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

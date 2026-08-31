'use client'

import { useEffect, useState } from 'react'
import { api, listFrom } from '@/lib/api'
import { PageHeader } from '@/components/app-shell'
import { Card, State } from '@/components/shared/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from 'recharts'
import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  
  useEffect(() => { 
    api<any>('/analytics/').then(r => { 
      setData(r.data || null)
      setError(r.error || '') 
    }) 
  }, [])
  
  if (error) {
    return (
      <>
        <PageHeader eyebrow="Intelligence" title="Analytics" description="Understand risk distribution across the dimensions returned by your service." />
        <Card><State error={error} /></Card>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <PageHeader eyebrow="Intelligence" title="Analytics" description="Understand risk distribution across the dimensions returned by your service." />
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="font-semibold">Analytics is ready for live data</h2>
            <State empty="Loading analytics from endpoint..." />
          </Card>
        </div>
      </>
    )
  }

  const rh = listFrom<any>(data.riskHistogram)
  const geo = listFrom<any>(data.geography)
  const salary = listFrom<any>(data.salaryBands)
  const cohorts = listFrom<any>(data.cohorts)

  // Formatter for Y-Axis numbers (e.g., 15000 -> 15k)
  const formatYAxis = (tickItem: number) => {
    if (tickItem === 0) return '0'
    if (tickItem >= 1000) return `${(tickItem / 1000).toFixed(0)}k`
    return tickItem.toString()
  }

  return (
    <>
      <PageHeader 
        eyebrow="Intelligence" 
        title="Analytics" 
        description="Understand risk distribution across the dimensions returned by your service." 
      />
      
      <div className="grid gap-6">
        
        {/* RISK HISTOGRAM */}
        <Card className="p-6">
          <h2 className="font-semibold mb-6">Risk Distribution Histogram</h2>
          <div className="h-72 w-full">
            {rh.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rh} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="bucket" axisLine={false} tickLine={false} className="text-[11px] font-mono fill-muted-foreground" />
                  <YAxis tickFormatter={formatYAxis} axisLine={false} tickLine={false} className="text-[11px] font-mono fill-muted-foreground" />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }} itemStyle={{ color: 'var(--primary)' }} labelStyle={{ color: 'var(--muted-foreground)', fontWeight: 600, marginBottom: '4px' }} />
                  <Bar dataKey="count" fill="url(#colorCount)" radius={[6, 6, 0, 0]} name="Customers" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <State empty="No risk distribution data returned." />
            )}
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          {/* GEOGRAPHY BREAKDOWN */}
          <Card className="p-6">
            <h2 className="font-semibold mb-6">Geography Breakdown</h2>
            <div className="h-72 w-full">
              {geo.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={geo} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      </linearGradient>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0.5}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[11px] font-medium fill-muted-foreground" />
                    <YAxis tickFormatter={formatYAxis} axisLine={false} tickLine={false} className="text-[11px] font-mono fill-muted-foreground" />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }} labelStyle={{ color: 'var(--muted-foreground)', fontWeight: 600, marginBottom: '4px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="safe" stackId="a" fill="url(#colorSafe)" name="Safe" />
                    <Bar dataKey="atRisk" stackId="a" fill="url(#colorRisk)" name="At Risk" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <State empty="No geography breakdown data returned." />
              )}
            </div>
          </Card>

          {/* SALARY BANDS */}
          <Card className="p-6">
            <h2 className="font-semibold mb-6">Salary Band Risk</h2>
            <div className="h-72 w-full">
              {salary.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salary} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.6}/>
                      </linearGradient>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--destructive)" stopOpacity={1.0}/>
                        <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[11px] font-medium fill-muted-foreground uppercase tracking-wider" />
                    <YAxis tickFormatter={formatYAxis} axisLine={false} tickLine={false} className="text-[11px] font-mono fill-muted-foreground" />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }} labelStyle={{ color: 'var(--muted-foreground)', fontWeight: 600, marginBottom: '4px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="safe" fill="url(#colorSafe)" name="Safe" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="atRisk" fill="url(#colorRisk)" name="At Risk" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <State empty="No salary band data returned." />
              )}
            </div>
          </Card>

          {/* RETENTION COHORTS */}
          {cohorts.length > 0 && (
            <Card className="p-6 xl:col-span-2">
              <h2 className="font-semibold mb-6">Retention Cohorts (%)</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cohorts} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="cohort" axisLine={false} tickLine={false} className="text-[11px] font-medium fill-muted-foreground" />
                    <YAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} className="text-[11px] font-mono fill-muted-foreground" />
                    <Tooltip cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }} labelStyle={{ color: 'var(--muted-foreground)', fontWeight: 600, marginBottom: '4px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="m1" stroke="var(--primary)" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Month 1" />
                    <Line type="monotone" dataKey="m3" stroke="#8b5cf6" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Month 3" />
                    <Line type="monotone" dataKey="m6" stroke="#ec4899" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Month 6" />
                    <Line type="monotone" dataKey="m12" stroke="var(--destructive)" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Month 12" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

        </div>
      </div>
    </>
  )
}

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
    api<any>('/analytics').then(r => { 
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
                <BarChart data={rh} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="bucket" axisLine={false} tickLine={false} className="text-xs font-mono" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs font-mono" />
                  <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Customers" />
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
                  <BarChart data={geo} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs font-mono" />
                    <YAxis axisLine={false} tickLine={false} className="text-xs font-mono" />
                    <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="safe" stackId="a" fill="var(--primary)" name="Safe" />
                    <Bar dataKey="atRisk" stackId="a" fill="var(--destructive)" name="At Risk" radius={[4, 4, 0, 0]} />
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
                  <BarChart data={salary} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs font-mono" />
                    <YAxis axisLine={false} tickLine={false} className="text-xs font-mono" />
                    <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="safe" fill="var(--primary)" name="Safe" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="atRisk" fill="var(--destructive)" name="At Risk" radius={[4, 4, 0, 0]} />
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
                  <LineChart data={cohorts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="cohort" axisLine={false} tickLine={false} className="text-xs font-mono" />
                    <YAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} className="text-xs font-mono" />
                    <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="m1" stroke="var(--primary)" strokeWidth={2} name="Month 1" />
                    <Line type="monotone" dataKey="m3" stroke="var(--color-chart-2)" strokeWidth={2} name="Month 3" />
                    <Line type="monotone" dataKey="m6" stroke="var(--color-chart-3)" strokeWidth={2} name="Month 6" />
                    <Line type="monotone" dataKey="m12" stroke="var(--destructive)" strokeWidth={2} name="Month 12" />
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

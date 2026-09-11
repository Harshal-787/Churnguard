'use client'

import { useEffect, useState } from 'react'
import { api, listFrom } from '@/lib/api'
import { PageHeader } from '@/components/app-shell'
import { Card, State } from '@/components/shared/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { BarChart3, TrendingDown, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'insights' | 'drift'>('insights')
  const [data, setData] = useState<any>(null)
  const [driftData, setDriftData] = useState<any>(null)
  const [error, setError] = useState('')
  
  useEffect(() => { 
    api<any>('/analytics/').then(r => { 
      setData(r.data || null)
      if(r.error) setError(r.error)
    })
    api<any>('/analytics/drift').then(r => {
      setDriftData(r.data || null)
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

  const formatYAxis = (tickItem: number) => {
    if (tickItem === 0) return '0'
    if (tickItem >= 1000) return `${(tickItem / 1000).toFixed(0)}k`
    return tickItem.toString()
  }

  const formatCurrency = (val: number) => `$${(val / 1000).toFixed(0)}k`

  const fin = data.financials || { safeRevenue: 0, revenueAtRisk: 0 }
  const revData = [
    { name: 'Safe Revenue', value: fin.safeRevenue },
    { name: 'At Risk Revenue', value: fin.revenueAtRisk }
  ]
  const shapData = listFrom<any>(data.shapFactors).sort((a,b) => b.value - a.value).slice(0, 5)
  const segmentData = listFrom<any>(data.segmentAverages)
  const pieColors = ['#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981']

  return (
    <>
      <PageHeader 
        eyebrow="Intelligence" 
        title="Analytics" 
        description="Understand risk distribution across the dimensions returned by your service." 
      />
      
      <div className="flex space-x-2 border-b border-border/40 pb-4 mb-6">
        <button 
          onClick={() => setActiveTab('insights')} 
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'insights' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
        >
          Customer Insights
        </button>
        <button 
          onClick={() => setActiveTab('drift')} 
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'drift' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
        >
          Data Drift
        </button>
      </div>

      {activeTab === 'drift' ? (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 md:col-span-1">
              <h2 className="font-semibold mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Overall Drift Score</h2>
              <p className="text-xs text-muted-foreground mb-4">Population Stability Index (PSI)</p>
              
              <div className="flex items-end gap-3 mt-8">
                <span className="text-5xl font-bold font-mono tracking-tighter">
                  {driftData?.overall_psi?.toFixed(2) || '---'}
                </span>
                <span className={`text-sm font-medium mb-1 px-2 py-1 rounded-md ${
                  driftData?.overall_psi > 0.2 ? 'bg-destructive/10 text-destructive' :
                  driftData?.overall_psi > 0.1 ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {driftData?.overall_psi > 0.2 ? 'Significant Drift' :
                   driftData?.overall_psi > 0.1 ? 'Moderate Drift' : 'Stable'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Last checked: {new Date(driftData?.last_updated).toLocaleString()}</p>
            </Card>

            <Card className="p-6 md:col-span-2">
               <h2 className="font-semibold mb-6">Feature Drift Breakdown</h2>
               {driftData?.features ? (
                 <div className="space-y-4">
                    {driftData.features.map((f: any) => (
                      <div key={f.name} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
                        <div className="flex items-center gap-3">
                          {f.status === 'stable' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {f.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                          {f.status === 'drifted' && <TrendingDown className="w-4 h-4 text-destructive" />}
                          <div>
                            <p className="text-sm font-medium">{f.name}</p>
                            <p className="text-xs text-muted-foreground">{f.message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-mono font-bold">PSI: {f.psi.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                 </div>
               ) : <State empty="Loading drift data..." />}
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">

          {/* FINANCIALS & SHAP */}
          <div className="grid gap-6 xl:grid-cols-3">
            
            <Card className="p-6">
              <h2 className="font-semibold mb-2">Revenue Impact</h2>
              <p className="text-xs text-muted-foreground mb-4">Total MRR broken down by current ML risk tier.</p>
              <div className="h-64 w-full">
                {fin.safeRevenue > 0 || fin.revenueAtRisk > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={revData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                        <Cell fill="var(--primary)" />
                        <Cell fill="var(--destructive)" />
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <State empty="No revenue data available." />}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold mb-2">Global SHAP Drivers</h2>
              <p className="text-xs text-muted-foreground mb-4">Top factors causing risk across all high-risk accounts.</p>
              <div className="h-64 w-full">
                {shapData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={shapData} outerRadius={80} dataKey="value" label={({name, percent}: any) => `${((percent || 0) * 100).toFixed(0)}%`} labelLine={false} stroke="none">
                        {shapData.map((_, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <State empty="No SHAP data available." />}
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="font-semibold mb-2">Segment Profile</h2>
              <p className="text-xs text-muted-foreground mb-4">Average trait comparison: Safe vs At Risk.</p>
              <div className="h-64 w-full">
                {segmentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={segmentData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                      <Radar name="Safe" dataKey="safe" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} />
                      <Radar name="At Risk" dataKey="atRisk" stroke="var(--destructive)" fill="var(--destructive)" fillOpacity={0.4} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : <State empty="No segment data available." />}
              </div>
            </Card>
            
          </div>
          
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
      )}
    </>
  )
}

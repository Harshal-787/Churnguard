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
  const pieColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Overall Drift Score Card */}
            <Card className="relative overflow-hidden p-6 lg:col-span-1 border-primary/20 bg-primary/5 flex flex-col justify-between min-h-[340px] premium-hover slide-up-fade animate-stagger-1">
              <div className="absolute -right-12 -top-12 size-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
              
              <div>
                <div className="relative z-10 flex items-start justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] mb-1.5">Model Monitoring</p>
                    <h2 className="font-semibold text-lg flex items-center gap-2">Overall Drift Score</h2>
                  </div>
                  <div className="p-2.5 bg-background rounded-xl shadow-sm border border-border">
                    <Activity className="size-5 text-primary" />
                  </div>
                </div>
                
                <div className="relative z-10">
                  <p className="text-sm text-muted-foreground mb-2">Population Stability Index (PSI)</p>
                  
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-6xl font-bold font-mono tracking-tighter text-foreground">
                      {driftData?.overall_psi?.toFixed(2) || '---'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-8 max-w-[80%]">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-emerald-500">Stable</span>
                      <span className="text-yellow-500">Moderate</span>
                      <span className="text-destructive">Severe</span>
                    </div>
                    <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: '33.33%' }} />
                      <div className="h-full bg-yellow-500" style={{ width: '33.33%' }} />
                      <div className="h-full bg-destructive" style={{ width: '33.33%' }} />
                      {/* Marker */}
                      {driftData?.overall_psi !== undefined && (
                         <div 
                           className="absolute top-0 bottom-0 w-1 bg-foreground rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-all duration-1000" 
                           style={{ left: `calc(${Math.min(98, (driftData.overall_psi / 0.3) * 100)}% - 2px)` }} 
                         />
                      )}
                    </div>
                  </div>

                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-semibold shadow-sm ${
                    driftData?.overall_psi > 0.2 ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    driftData?.overall_psi > 0.1 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  }`}>
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        driftData?.overall_psi > 0.2 ? 'bg-destructive' :
                        driftData?.overall_psi > 0.1 ? 'bg-yellow-500' :
                        'bg-emerald-500'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        driftData?.overall_psi > 0.2 ? 'bg-destructive' :
                        driftData?.overall_psi > 0.1 ? 'bg-yellow-500' :
                        'bg-emerald-500'
                      }`}></span>
                    </span>
                    {driftData?.overall_psi > 0.2 ? 'Significant Drift Detected' :
                     driftData?.overall_psi > 0.1 ? 'Moderate Drift Detected' : 'Model is Stable'}
                  </div>
                </div>
              </div>
              
              <div className="relative z-10 mt-8 pt-4 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground">
                <span className="font-medium">Last evaluated</span>
                <span>{new Date(driftData?.last_updated).toLocaleString()}</span>
              </div>
            </Card>

            {/* Feature Drift Breakdown */}
            <Card className="relative overflow-hidden lg:col-span-2 min-h-[340px] flex flex-col premium-hover slide-up-fade animate-stagger-2">
              <div className="p-6 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
                <div>
                  <h2 className="font-semibold text-lg">Feature Drift Breakdown</h2>
                  <p className="text-xs text-muted-foreground mt-1">Detailed stability analysis across top model features</p>
                </div>
                <div className="flex gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Stable (&lt; 0.1)</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" /> Warning (0.1 - 0.2)</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> Drifted (&gt; 0.2)</div>
                </div>
              </div>
              
              <div className="p-6 flex-1 overflow-auto">
               {driftData?.features ? (
                 <div className="grid gap-3">
                    {driftData.features.map((f: any) => {
                      const isStable = f.status === 'stable' || f.psi < 0.1;
                      const isWarning = f.status === 'warning' || (f.psi >= 0.1 && f.psi <= 0.2);
                      const isDrifted = f.status === 'drifted' || f.psi > 0.2;
                      
                      return (
                        <div key={f.name} className={`relative flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${
                          isDrifted ? 'bg-destructive/5 border-destructive/30 hover:border-destructive/50' :
                          isWarning ? 'bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/50' :
                          'bg-card border-border/50 hover:border-primary/30'
                        }`}>
                          
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center justify-center size-10 rounded-full border shadow-sm ${
                              isDrifted ? 'bg-background border-destructive/30' :
                              isWarning ? 'bg-background border-yellow-500/30' :
                              'bg-muted/50 border-border'
                            }`}>
                              {isStable && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                              {isWarning && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                              {isDrifted && <TrendingDown className="w-5 h-5 text-destructive" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold font-mono tracking-tight">{f.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{f.message}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8 pl-4">
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">PSI Score</span>
                              <span className={`text-base font-bold font-mono ${
                                isDrifted ? 'text-destructive' :
                                isWarning ? 'text-yellow-500' :
                                'text-foreground'
                              }`}>
                                {f.psi.toFixed(3)}
                              </span>
                            </div>
                            
                            {/* Visual PSI bar */}
                            <div className="hidden sm:block w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-1000 ${
                                isDrifted ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                                isWarning ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' :
                                'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                              }`} style={{ width: `${Math.min(100, (f.psi / 0.3) * 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                 </div>
               ) : <State empty="Loading advanced drift telemetry..." />}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">

          {/* FINANCIALS & SHAP */}
          <div className="grid gap-6 xl:grid-cols-3">
            
            <Card className="p-6 premium-hover slide-up-fade animate-stagger-1">
              <h2 className="font-semibold mb-2">Revenue Impact</h2>
              <p className="text-xs text-muted-foreground mb-4">Total MRR broken down by current ML risk tier.</p>
              <div className="h-64 w-full">
                {fin.safeRevenue > 0 || fin.revenueAtRisk > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={revData} innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
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

            <Card className="p-6 premium-hover slide-up-fade animate-stagger-2">
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
            
            <Card className="p-6 premium-hover slide-up-fade animate-stagger-3">
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
          <Card className="p-6 premium-hover slide-up-fade animate-stagger-4">
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
            <Card className="p-6 premium-hover slide-up-fade animate-stagger-5">
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
            <Card className="p-6 premium-hover slide-up-fade animate-stagger-6">
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
              <Card className="p-6 xl:col-span-2 premium-hover slide-up-fade animate-stagger-1">
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

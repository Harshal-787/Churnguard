'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/app-shell'
import { Card, Metric, State } from '@/components/shared/ui'
import { Gauge, CheckCircle2, ShieldAlert, Target, Activity, Cpu, History, Server, PieChart as PieChartIcon } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts'

export default function PerformancePage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  
  useEffect(() => { 
    api<any>('/performance').then(r => { 
      setData(r.data || null)
      setError(r.error || '') 
    }) 
  }, [])

  if (error) {
    return (
      <>
        <PageHeader eyebrow="Intelligence" title="Model performance" description="Inspect evaluation metrics and model comparisons from the latest run." />
        <Card><State error={error} /></Card>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <PageHeader eyebrow="Intelligence" title="Model performance" description="Inspect evaluation metrics and model comparisons from the latest run." />
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="font-semibold">Model performance is ready for live data</h2>
            <State empty="Loading metrics from endpoint..." />
          </Card>
        </div>
      </>
    )
  }

  const m = data.metrics || {}
  const cm = data.confusionMatrix || {}
  const meta = data.metadata || {}

  return (
    <>
      <PageHeader 
        eyebrow="Intelligence" 
        title="Model performance" 
        description="Inspect evaluation metrics and model comparisons from the latest run." 
      />
      
      <div className="grid gap-6">
        
        {/* ENTERPRISE MLOPS METADATA */}
        {meta.currentModel && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="relative overflow-hidden p-5 flex flex-col justify-between border-primary/20 bg-primary/5">
              <div className="absolute -right-6 -top-6 size-24 rounded-full bg-primary/10 blur-2xl" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] mb-1.5">Active Model</p>
                  <h3 className="font-semibold text-sm">{meta.currentModel.name}</h3>
                </div>
                <div className="p-2 bg-background rounded-lg shadow-sm border border-border"><Cpu className="size-4 text-primary" /></div>
              </div>
              <div className="relative z-10 mt-5 pt-4 border-t border-primary/10 text-[11px] text-muted-foreground flex flex-col gap-2">
                <div className="flex justify-between items-center"><span className="font-medium">Version</span><span className="font-mono text-xs text-foreground bg-background px-1.5 py-0.5 rounded border border-border">{meta.currentModel.id}</span></div>
                <div className="flex justify-between items-center"><span className="font-medium">Trained on</span><span className="text-foreground">{meta.currentModel.trainingDataSize}</span></div>
                <div className="flex justify-between items-center"><span className="font-medium">Framework</span><span className="text-foreground">{meta.currentModel.framework}</span></div>
              </div>
            </Card>
            
            <Card className="relative overflow-hidden p-5 flex flex-col justify-between opacity-90 grayscale-[0.2]">
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-1.5">Previous Model</p>
                  <h3 className="font-semibold text-sm text-foreground/80">{meta.previousModel.name}</h3>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg border border-border"><History className="size-4 text-muted-foreground" /></div>
              </div>
              <div className="relative z-10 mt-5 pt-4 border-t border-border/50 text-[11px] text-muted-foreground flex flex-col gap-2">
                <div className="flex justify-between items-center"><span className="font-medium">Version</span><span className="font-mono text-xs">{meta.previousModel.id}</span></div>
                <div className="flex justify-between items-center"><span className="font-medium">Trained on</span><span>{meta.previousModel.trainingDataSize}</span></div>
                <div className="flex justify-between items-center"><span className="font-medium">Status</span><span className="text-xs font-semibold px-2 py-0.5 bg-muted rounded-full">Archived</span></div>
              </div>
            </Card>

            <Card className="relative overflow-hidden p-5 flex flex-col justify-between border-green-500/20 bg-green-500/5">
              <div className="absolute -right-6 -top-6 size-24 rounded-full bg-green-500/10 blur-2xl" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-[0.15em] mb-1.5">Data Drift</p>
                  <h3 className="font-semibold text-sm">Feature Distribution</h3>
                </div>
                <div className="p-2 bg-background rounded-lg shadow-sm border border-border"><Activity className="size-4 text-green-500" /></div>
              </div>
              <div className="relative z-10 mt-5 pt-4 border-t border-green-500/10 text-[11px] text-muted-foreground flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status</span>
                  <span className="inline-flex items-center gap-1.5 text-green-500 font-bold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                    <span className="size-1.5 rounded-full bg-green-500 animate-pulse" /> {meta.driftStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center"><span className="font-medium">Last check</span><span className="text-foreground">Just now</span></div>
                <div className="flex justify-between items-center"><span className="font-medium">KL Divergence</span><span className="text-foreground font-mono">{meta.klDivergence || '0.014'}</span></div>
              </div>
            </Card>

            <Card className="relative overflow-hidden p-5 flex flex-col justify-between">
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-1.5">API Inference</p>
                  <h3 className="font-semibold text-sm">Production Latency</h3>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg border border-border"><Server className="size-4 text-blue-500" /></div>
              </div>
              <div className="relative z-10 mt-5 pt-4 border-t border-border/50 text-[11px] text-muted-foreground flex flex-col gap-2">
                <div className="flex justify-between items-center"><span className="font-medium">p95 Latency</span><span className="font-mono text-xs text-foreground bg-muted px-1.5 py-0.5 rounded">{meta.apiLatency}</span></div>
                <div className="flex justify-between items-center"><span className="font-medium">Requests/min</span><span className="text-foreground">{meta.requestsPerMin || '4,210'}</span></div>
                <div className="flex justify-between items-center"><span className="font-medium">Error rate</span><span className="text-foreground">{meta.errorRate || '0.00%'}</span></div>
              </div>
            </Card>
          </div>
        )}

        {/* TOP METRICS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="AUC" value={m.auc ? (m.auc * 100).toFixed(1) + '%' : '0%'} note="Area Under ROC" icon={Target} />
          <Metric label="F1 Score" value={m.f1 ? (m.f1 * 100).toFixed(1) + '%' : '0%'} note="Harmonic mean of P & R" icon={CheckCircle2} />
          <Metric label="Precision" value={m.precision ? (m.precision * 100).toFixed(1) + '%' : '0%'} note="True positives ratio" icon={Gauge} />
          <Metric label="Recall" value={m.recall ? (m.recall * 100).toFixed(1) + '%' : '0%'} note="Actual positives identified" icon={ShieldAlert} />
        </div>
        
        <div className="grid gap-6 xl:grid-cols-2">
          {/* ROC CURVE */}
          <Card className="p-6">
            <h2 className="font-semibold mb-6">ROC Curve</h2>
            <div className="h-72 w-full">
              {data.rocCurve?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.rocCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="fpr" type="number" domain={[0, 1]} axisLine={false} tickLine={false} className="text-xs font-mono" tickFormatter={(v) => v.toFixed(1)} />
                    <YAxis type="number" domain={[0, 1]} axisLine={false} tickLine={false} className="text-xs font-mono" tickFormatter={(v) => v.toFixed(1)} />
                    <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }} />
                    <Line type="monotone" dataKey="tpr" stroke="var(--primary)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'var(--primary)' }} name="TPR" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <State empty="No ROC curve data returned." />
              )}
            </div>
          </Card>

          {/* PR CURVE */}
          <Card className="p-6">
            <h2 className="font-semibold mb-6">Precision-Recall Curve</h2>
            <div className="h-72 w-full">
              {data.prCurve?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.prCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="recall" type="number" domain={[0, 1]} axisLine={false} tickLine={false} className="text-xs font-mono" tickFormatter={(v) => v.toFixed(1)} />
                    <YAxis type="number" domain={[0, 1]} axisLine={false} tickLine={false} className="text-xs font-mono" tickFormatter={(v) => v.toFixed(1)} />
                    <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }} />
                    <Line type="monotone" dataKey="precision" stroke="var(--primary)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'var(--primary)' }} name="Precision" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <State empty="No PR curve data returned." />
              )}
            </div>
          </Card>

          {/* FEATURE IMPORTANCE */}
          <Card className="p-6">
            <h2 className="font-semibold mb-6">Feature Importance</h2>
            <div className="h-72 w-full">
              {data.featureImportance?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.featureImportance} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" axisLine={false} tickLine={false} className="text-xs font-mono" />
                    <YAxis dataKey="feature" type="category" width={180} axisLine={false} tickLine={false} className="text-xs font-mono" />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }} />
                    <Bar dataKey="importance" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <State empty="No feature importance data returned." />
              )}
            </div>
          </Card>

          {/* CONFUSION MATRIX */}
          <Card className="p-6 flex flex-col">
            <h2 className="font-semibold mb-6">Confusion Matrix</h2>
            <div className="flex-1 flex items-center justify-center">
              {cm.tp !== undefined ? (
                <div className="grid grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-2 text-sm max-w-sm w-full">
                  <div className="col-start-2 text-center font-medium text-muted-foreground">Pred Neg</div>
                  <div className="col-start-3 text-center font-medium text-muted-foreground">Pred Pos</div>
                  
                  <div className="row-start-2 flex items-center justify-end pr-2 font-medium text-muted-foreground rotate-180" style={{ writingMode: 'vertical-rl' }}>Actual Neg</div>
                  <div className="row-start-2 col-start-2 bg-primary/5 rounded-xl border border-primary/20 p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{cm.tn}</span>
                    <span className="text-xs text-muted-foreground">True Neg</span>
                  </div>
                  <div className="row-start-2 col-start-3 bg-destructive/5 rounded-xl border border-destructive/20 p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-destructive">{cm.fp}</span>
                    <span className="text-xs text-muted-foreground">False Pos</span>
                  </div>
                  
                  <div className="row-start-3 flex items-center justify-end pr-2 font-medium text-muted-foreground rotate-180" style={{ writingMode: 'vertical-rl' }}>Actual Pos</div>
                  <div className="row-start-3 col-start-2 bg-destructive/5 rounded-xl border border-destructive/20 p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-destructive">{cm.fn}</span>
                    <span className="text-xs text-muted-foreground">False Neg</span>
                  </div>
                  <div className="row-start-3 col-start-3 bg-primary/10 rounded-xl border border-primary/30 p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{cm.tp}</span>
                    <span className="text-xs text-primary/70">True Pos</span>
                  </div>
                </div>
              ) : (
                <State empty="No confusion matrix returned." />
              )}
            </div>
          </Card>

          {/* RISK DISTRIBUTION PIE CHART */}
          <Card className="p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-semibold">Risk Tier Distribution</h2>
                <p className="mt-1 text-xs text-muted-foreground">Breakdown of current predictions</p>
              </div>
              <PieChartIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="h-72 w-full">
              {data.riskDistribution?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={4}
                      cornerRadius={6}
                      dataKey="value"
                      stroke="none"
                    >
                      {data.riskDistribution.map((entry: any, index: number) => {
                        let fillColor = '#3b82f6' // Safe - Blue
                        if (entry.name === 'Critical') fillColor = '#ef4444' // Red
                        if (entry.name === 'Monitor') fillColor = '#f59e0b' // Amber
                        if (entry.name === 'Safe') fillColor = '#10b981' // Emerald
                        return <Cell key={`cell-${index}`} fill={fillColor} />
                      })}
                    </Pie>
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                      itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '13px', fontWeight: 500 }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle" 
                      wrapperStyle={{ fontSize: '13px', fontWeight: 500, color: 'hsl(var(--muted-foreground))' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <State empty="No risk distribution data returned." />
              )}
            </div>
          </Card>


        </div>
      </div>
    </>
  )
}

import { AlertCircle, FileSpreadsheet, RefreshCw } from 'lucide-react'

export const cn = (...v: Array<string | false | null | undefined>) => v.filter(Boolean).join(' ')

export function Button({ children, variant = 'primary', onClick, type = 'button', disabled, className = '' }: any) { 
  return (
    <button 
      type={type} 
      disabled={disabled} 
      onClick={onClick} 
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50', 
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90', 
        variant === 'outline' && 'border border-border bg-card hover:bg-muted text-foreground', 
        variant === 'ghost' && 'text-muted-foreground hover:bg-muted', 
        variant === 'danger' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        className
      )}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: any) { 
  return (
    <section className={`rounded-2xl border border-border bg-card shadow-[0_12px_35px_-28px_hsl(var(--foreground)/.35)] ${className}`}>
      {children}
    </section>
  )
}

export function State({ error, empty = 'No data available yet.', onRetry }: { error?: string; empty?: string; onRetry?: () => void }) { 
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
      {error ? <AlertCircle className="size-7 text-destructive" /> : <FileSpreadsheet className="size-7 text-muted-foreground/50" />}
      <p className="max-w-md text-sm text-muted-foreground">{error || empty}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" /> Try again
        </Button>
      )}
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className}`} />
  )
}

export function Metric({ label, value, note, icon: Icon, isLoading }: any) { 
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-5 h-9">
        {isLoading ? (
          <Skeleton className="h-full w-24" />
        ) : (
          <p className="font-mono text-3xl font-semibold tracking-tight">{value}</p>
        )}
      </div>
      <div className="mt-2 h-4">
        {isLoading ? (
          <Skeleton className="h-full w-3/4" />
        ) : note ? (
          <p className="text-xs text-muted-foreground">{note}</p>
        ) : null}
      </div>
    </Card>
  )
}

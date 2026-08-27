'use client'

import { AppShell } from '@/components/app-shell'
import { hasSession } from '@/lib/api'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (!hasSession()) {
      router.push('/login')
    } else {
      setAuthorized(true)
    }
  }, [pathname, router])

  if (!authorized) {
    return null
  }

  return <AppShell>{children}</AppShell>
}

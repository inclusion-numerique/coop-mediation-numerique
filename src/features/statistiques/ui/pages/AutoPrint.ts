'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export const AutoPrint = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const shouldPrint = searchParams.get('print') === 'true'
    if (!shouldPrint) return

    const timer = setTimeout(() => {
      window.print()
      router.back()
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchParams, router])

  return null
}

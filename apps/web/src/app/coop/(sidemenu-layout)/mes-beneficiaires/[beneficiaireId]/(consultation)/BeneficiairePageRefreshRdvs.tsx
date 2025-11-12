'use client'

import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const BeneficiairePageRefreshRdvs = ({
  userId,
  syncDataOnLoad,
}: {
  userId: string
  syncDataOnLoad: boolean
}) => {
  const router = useRouter()
  const refreshRdvDataMutation =
    trpc.rdvServicePublic.refreshRdvData.useMutation()

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshRdvDataMutation is not in dependencies as it should not retrigger the call
  useEffect(() => {
    if (syncDataOnLoad) {
      refreshRdvDataMutation.mutateAsync({ userId }).then((result) => {
        if (result?.hasDiff) {
          router.refresh()
        }
      })
    }
  }, [syncDataOnLoad, userId, router])

  return null
}

export default withTrpc(BeneficiairePageRefreshRdvs)

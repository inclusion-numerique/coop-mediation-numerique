import { SessionUser } from '@app/web/auth/sessionUser'
import { getRdvOauthIntegrationStatus } from '@app/web/rdv-service-public/rdvIntegrationOauthStatus'
import { trpc } from '@app/web/trpc'
import { useEffect, useState } from 'react'

export type RdvOauthIntegrationStatus = 'loading' | 'none' | 'success' | 'error'

export const useRdvIntegrationOauthStatus = ({
  user,
}: {
  user: Pick<SessionUser, 'rdvAccount'>
}) => {
  const oauthApiCallMutation = trpc.rdvServicePublic.oAuthApiMe.useMutation()
  const hasOauthTokens = user.rdvAccount?.hasOauthTokens ?? false

  const [status, setStatus] = useState<RdvOauthIntegrationStatus>(
    getRdvOauthIntegrationStatus({ user }),
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: oauthApiCallMutation.isPending is not in dependencies as it should not retrigger the call
  useEffect(() => {
    if (!hasOauthTokens || oauthApiCallMutation.isPending) return
    oauthApiCallMutation
      .mutateAsync({
        endpoint: '/agents/me',
        data: undefined,
      })
      .then((result) => {
        if (result?.agent?.id) {
          return 'success' as const
        }
        return 'none' as const
      })
      .catch(() => 'error' as const)
      .then((result) => {
        setStatus(result)
      })

    return () => {
      oauthApiCallMutation.reset()
    }
  }, [hasOauthTokens, oauthApiCallMutation.mutateAsync])

  return {
    status,
    isLoading: status === 'loading',
    isError: status === 'error',
    isNone: status === 'none',
    isSuccess: status === 'success',
  }
}

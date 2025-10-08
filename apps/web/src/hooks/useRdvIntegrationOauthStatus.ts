import { SessionUser } from '@app/web/auth/sessionUser'
import { RdvApiOrganisation } from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import { getRdvOauthIntegrationStatus } from '@app/web/rdv-service-public/rdvIntegrationOauthStatus'
import { trpc } from '@app/web/trpc'
import { useEffect, useState } from 'react'

export type RdvOauthIntegrationStatus = 'loading' | 'none' | 'success' | 'error'

export const useRdvIntegrationOauthStatus = ({
  user,
}: {
  user: Pick<SessionUser, 'rdvAccount'>
}) => {
  const meOauthCall = trpc.rdvServicePublic.oAuthApiMe.useMutation()
  const organisationsOauthCall =
    trpc.rdvServicePublic.oAuthApiGetOrganisations.useMutation()
  const hasOauthTokens = user.rdvAccount?.hasOauthTokens ?? false

  const [status, setStatus] = useState<RdvOauthIntegrationStatus>(
    getRdvOauthIntegrationStatus({ user }),
  )

  const [organisations, setOrganisations] = useState<RdvApiOrganisation[]>([])

  // biome-ignore lint/correctness/useExhaustiveDependencies: oauthApiCallMutation.isPending is not in dependencies as it should not retrigger the call
  useEffect(() => {
    if (
      !hasOauthTokens ||
      meOauthCall.isPending ||
      organisationsOauthCall.isPending
    )
      return
    meOauthCall
      .mutateAsync()
      .then((result) => {
        if (result?.agent?.id) {
          return 'success' as const
        }
        return 'none' as const
      })
      .catch(() => 'error' as const)
      .then(async (result) => {
        if (result === 'success') {
          const organizationsResult = await organisationsOauthCall.mutateAsync()
          setOrganisations(organizationsResult)
        }

        setStatus(result)
      })

    return () => {
      meOauthCall.reset()
      organisationsOauthCall.reset()
    }
  }, [
    hasOauthTokens,
    meOauthCall.mutateAsync,
    organisationsOauthCall.mutateAsync,
  ])

  return {
    status,
    organisations,
    isLoading: status === 'loading',
    isError: status === 'error',
    isNone: status === 'none',
    isSuccess: status === 'success',
  }
}

'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import type { SessionUser } from '@app/web/auth/sessionUser'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { BeneficiaireCraData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import { getRdvOauthIntegrationStatus } from '@app/web/rdv-service-public/rdvIntegrationOauthStatus'
import { hasFeatureFlag } from '@app/web/security/hasFeatureFlag'
import { trpc } from '@app/web/trpc'
import { getServerUrl } from '@app/web/utils/baseUrl'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'

const PrendreRendezVousAvecBeneficiaireButton = ({
  beneficiaire,
  user,
  returnPath,
  className,
}: {
  beneficiaire: { id: string }
  user: SessionUser
  returnPath: string // path on the app (e.g. /beneficiaires/12)
  className?: string
}) => {
  const mutation = trpc.rdvServicePublic.oAuthApiCreateRdvPlan.useMutation()

  const oauthStatus = getRdvOauthIntegrationStatus({ user })

  const router = useRouter()

  if (!hasFeatureFlag(user, 'RdvServicePublic') || oauthStatus !== 'success') {
    return null
  }

  const onClick = async () => {
    try {
      const result = await mutation.mutateAsync({
        beneficiaireId: beneficiaire.id,
        returnUrl: getServerUrl(returnPath, { absolutePath: true }),
      })

      router.push(result.rdv_plan.url)
    } catch {
      createToast({
        priority: 'error',
        message: 'Une erreur est survenue lors de la création du RDV',
      })
    }
  }

  const isLoading = mutation.isPending || mutation.isSuccess

  return (
    <Button
      priority="primary"
      size="small"
      iconId="fr-icon-calendar-line"
      {...buttonLoadingClassname(isLoading)}
      onClick={onClick}
      type="button"
      className={className}
    >
      Planifier un rendez-vous
    </Button>
  )
}

export default withTrpc(PrendreRendezVousAvecBeneficiaireButton)

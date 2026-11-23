'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  type CompteDeLaSession,
  statutDuCompteDeLaSession,
} from '@/features/rdvsp/domain/compte/sante-compte'
import { inject } from '@/libraries/nextjs/injection/client'
import { createToast } from '@/libraries/ui/toast/createToast'
import { buttonLoadingClassname } from '@/libraries/ui/utils/buttonLoadingClassname'
import { PRENDRE_RENDEZ_VOUS_ACTION_KEY } from '../../action/prendre-rendez-vous.key'

const PrendreRendezVousAvecBeneficiaireButton = ({
  beneficiaire,
  user,
  className,
}: {
  beneficiaire: { id: string }
  user: {
    readonly id: string
    readonly rdvAccount: CompteDeLaSession | null
  }
  className?: string
}) => {
  const [enCours, setEnCours] = useState(false)

  const oauthStatus = statutDuCompteDeLaSession(user.rdvAccount)

  const router = useRouter()

  if (oauthStatus !== 'connecte') {
    return null
  }

  const onClick = async () => {
    setEnCours(true)
    const result = await inject(PRENDRE_RENDEZ_VOUS_ACTION_KEY)({
      beneficiaireId: beneficiaire.id,
    })

    if (!result.success) {
      setEnCours(false)
      createToast({
        priority: 'error',
        message: 'Une erreur est survenue lors de la création du RDV',
      })
      return
    }

    router.push(result.data.url)
  }

  return (
    <Button
      priority="primary"
      size="small"
      iconId="fr-icon-calendar-line"
      {...buttonLoadingClassname(enCours)}
      onClick={onClick}
      type="button"
      className={className}
    >
      Planifier un rendez-vous
    </Button>
  )
}

export default PrendreRendezVousAvecBeneficiaireButton

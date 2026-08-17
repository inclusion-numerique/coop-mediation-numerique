'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { prendreRendezVousAction } from '@app/web/app/_actions/rdvsp/prendre-rendez-vous.action'
import type { SessionUser } from '@app/web/auth/sessionUser'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const PrendreRendezVousAvecBeneficiaireButton = ({
  beneficiaire,
  user,
  className,
}: {
  beneficiaire: { id: string }
  user: Pick<SessionUser, 'id' | 'rdvAccount'>
  className?: string
}) => {
  const [enCours, setEnCours] = useState(false)

  const oauthStatus = user.rdvAccount?.statut ?? 'none'

  const router = useRouter()

  if (oauthStatus !== 'success') {
    return null
  }

  const onClick = async () => {
    setEnCours(true)
    const result = await prendreRendezVousAction({
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

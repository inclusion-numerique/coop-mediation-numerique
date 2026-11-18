'use client'

import { Button } from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { declencherSynchronisationAction } from '@/app/_actions/rdvsp/declencher-synchronisation.action'
import type { UserId } from '@/features/authentification/domain/user'
import { createToast } from '@/libraries/ui/toast/createToast'
import { buttonLoadingClassname } from '@/libraries/ui/utils/buttonLoadingClassname'

const AdministrationSyncUserDataButton = ({
  user: { id },
}: {
  user: UserId
}) => {
  const router = useRouter()
  const [synchronisationEnCours, setSynchronisationEnCours] = useState(false)

  const onSync = async () => {
    setSynchronisationEnCours(true)

    const resultat = await declencherSynchronisationAction({
      utilisateurId: id,
    })

    setSynchronisationEnCours(false)

    createToast(
      resultat.success
        ? {
            priority: 'success',
            message: 'Les informations ont été synchronisées avec succès.',
          }
        : { priority: 'error', message: resultat.error },
    )

    router.refresh()
  }

  return (
    <Button
      type="button"
      priority="primary"
      iconId="fr-icon-refresh-line"
      onClick={onSync}
      {...buttonLoadingClassname(synchronisationEnCours)}
    >
      Synchroniser
    </Button>
  )
}

export default AdministrationSyncUserDataButton

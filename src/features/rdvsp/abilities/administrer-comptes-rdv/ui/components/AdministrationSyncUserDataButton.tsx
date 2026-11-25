'use client'

import { Button } from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DECLENCHER_SYNCHRONISATION_ACTION_KEY } from '@/features/rdvsp/action/declencher-synchronisation.key'
import { inject } from '@/libraries/nextjs/injection'
import { createToast } from '@/libraries/ui/toast'
import { buttonLoadingClassname } from '@/libraries/ui/utils'

const AdministrationSyncUserDataButton = ({
  user: { id },
}: {
  user: { readonly id: string }
}) => {
  const router = useRouter()
  const [synchronisationEnCours, setSynchronisationEnCours] = useState(false)

  const onSync = async () => {
    setSynchronisationEnCours(true)

    const resultat = await inject(DECLENCHER_SYNCHRONISATION_ACTION_KEY)({
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

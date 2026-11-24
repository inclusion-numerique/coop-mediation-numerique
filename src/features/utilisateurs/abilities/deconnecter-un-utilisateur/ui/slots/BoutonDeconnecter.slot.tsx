'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { inject } from '@/libraries/nextjs/injection/client'
import { createToast } from '@/libraries/ui/toast/create-toast'
import { buttonLoadingClassname } from '@/libraries/ui/utils/button-loading-classname'
import { DECONNECTER_UN_UTILISATEUR_ACTION_KEY } from '../../action/deconnecter-un-utilisateur.key'

export const BoutonDeconnecter = ({
  utilisateurId,
}: {
  utilisateurId: string
}) => {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()

  const deconnecter = () =>
    demarrer(async () => {
      const resultat = await inject(DECONNECTER_UN_UTILISATEUR_ACTION_KEY)({
        utilisateurId,
      })

      if (!resultat.success) {
        createToast({ priority: 'error', message: resultat.error })
        return
      }

      createToast({
        priority: 'success',
        message:
          resultat.data.sessionsFermees > 0
            ? 'L’utilisateur a bien été déconnecté.'
            : 'L’utilisateur n’avait aucune session active.',
      })
      router.refresh()
    })

  return (
    <Button
      type="button"
      iconId="fr-icon-logout-box-r-line"
      priority="tertiary"
      size="small"
      onClick={deconnecter}
      {...buttonLoadingClassname(enCours)}
    >
      Déconnecter
    </Button>
  )
}

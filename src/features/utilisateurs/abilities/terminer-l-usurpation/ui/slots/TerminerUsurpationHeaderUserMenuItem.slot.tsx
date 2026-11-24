'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { TERMINER_L_USURPATION_ACTION_KEY } from '@/features/utilisateurs/abilities/terminer-l-usurpation/action/terminer-l-usurpation.key'
import { inject } from '@/libraries/nextjs/injection/client'
import { createToast } from '@/libraries/ui/toast/create-toast'
import { buttonLoadingClassname } from '@/libraries/ui/utils/button-loading-classname'

const TerminerUsurpationHeaderUserMenuItem = () => {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()

  const terminer = () =>
    demarrer(async () => {
      const resultat = await inject(TERMINER_L_USURPATION_ACTION_KEY)()

      if (!resultat.success) {
        createToast({ priority: 'error', message: resultat.error })
        return
      }

      createToast({
        priority: 'success',
        message: `Usurpation terminée, vous êtes de retour en tant que ${resultat.data.nom}`,
      })
      router.replace('/administration/usurpation')
    })

  return (
    <li>
      <button
        {...buttonLoadingClassname(
          enCours,
          'fr-nav__link fr-border--bottom fr-display-block',
        )}
        type="button"
        onClick={terminer}
      >
        <span
          className="fr-icon-user-star-line fr-icon--sm fr-mr-1w"
          style={{ color: 'var(--blue-france-sun-113-625)' }}
        />
        Terminer usurpation
      </button>
    </li>
  )
}

export default TerminerUsurpationHeaderUserMenuItem

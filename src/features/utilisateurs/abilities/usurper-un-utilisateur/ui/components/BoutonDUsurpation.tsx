'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { routeConstruite } from '@/libraries/nextjs'
import { inject } from '@/libraries/nextjs/injection'
import { createToast } from '@/libraries/ui/toast'
import { buttonLoadingClassname } from '@/libraries/ui/utils'
import { USURPER_UN_UTILISATEUR_ACTION_KEY } from '../../action/usurper-un-utilisateur.key'

export const BoutonDUsurpation = ({
  utilisateurId,
  desactive = false,
  taille = 'medium',
  className,
}: {
  utilisateurId: string
  desactive?: boolean
  taille?: 'small' | 'large' | 'medium'
  className?: string
}) => {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()

  const usurper = () =>
    demarrer(async () => {
      const resultat = await inject(USURPER_UN_UTILISATEUR_ACTION_KEY)({
        utilisateurId,
      })

      if (!resultat.success) {
        createToast({ priority: 'error', message: resultat.error })
        return
      }

      createToast({
        priority: 'success',
        message: `Vous êtes maintenant connecté en tant que ${resultat.data.nom}`,
      })
      router.replace(routeConstruite(resultat.data.redirection))
      router.refresh()
    })

  return (
    <Button
      type="button"
      iconId="fr-icon-user-star-line"
      priority="secondary"
      size={taille}
      disabled={desactive}
      onClick={usurper}
      {...buttonLoadingClassname(enCours, className)}
    >
      Usurper
    </Button>
  )
}

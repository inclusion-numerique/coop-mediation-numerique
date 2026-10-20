'use client'

import { createToast } from '@app/ui/toast/createToast'
import { confirmerLExerciceApresRuptureAction } from '@app/web/app/_actions/mediateurs/confirmer-l-exercice-apres-rupture.action'
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import type { reponsesApresRupture } from '../domain/reponse-apres-rupture'

export const ConfirmationApresRupture = () => {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()

  const repondre = (reponse: (typeof reponsesApresRupture)[number]) =>
    demarrer(async () => {
      const resultat = await confirmerLExerciceApresRuptureAction({ reponse })

      if (!resultat.success) {
        createToast({
          priority: 'error',
          message: resultat.error,
        })
      }

      router.refresh()
    })

  return (
    <div className="fr-my-32v fr-p-12v fr-width-full fr-border-radius--8 fr-background-default--grey">
      <h1 className="fr-h3">
        Nous avons été notifiés de la rupture de votre contrat
      </h1>
      <p className="fr-text--xl fr-text--bold">
        Continuez-vous d’exercer une activité de médiateur numérique&nbsp;?
      </p>
      <p>
        Si vous n’exercez plus, vos informations (nom, prénom, adresse e-mail,
        numéro de téléphone) ne seront plus visibles sur la cartographie
        nationale des lieux d’inclusion numérique. Si vous continuez, votre
        visibilité reste celle que vous aviez choisie.
      </p>
      <ButtonsGroup
        inlineLayoutWhen="md and up"
        buttons={[
          {
            children: 'Oui, je continue d’exercer',
            disabled: enCours,
            onClick: () => repondre('ContinueDExercer'),
          },
          {
            children: 'Non, je n’exerce plus',
            priority: 'secondary',
            disabled: enCours,
            onClick: () => repondre('NExercePlus'),
          },
        ]}
      />
    </div>
  )
}

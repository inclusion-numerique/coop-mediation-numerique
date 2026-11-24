'use client'

import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { inject } from '@/libraries/nextjs/injection/client'
import { createToast } from '@/libraries/ui/toast/create-toast'
import { CHOISIR_LA_VISIBILITE_APRES_RUPTURE_ACTION_KEY } from '../../action/choisir-la-visibilite-apres-rupture.key'
import type { reponsesApresRupture } from '../../domain/reponse-apres-rupture'

export const ChoixDeVisibiliteApresRupture = () => {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()

  const repondre = (reponse: (typeof reponsesApresRupture)[number]) =>
    demarrer(async () => {
      const resultat = await inject(
        CHOISIR_LA_VISIBILITE_APRES_RUPTURE_ACTION_KEY,
      )({
        reponse,
      })

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
        Votre profil n’est plus visible sur la cartographie
      </h1>
      <p>
        Votre structure nous a informés de la fin de votre contrat. Si votre
        profil était visible, il n’apparaît désormais plus sur la cartographie.
        Vous pouvez choisir de rendre à nouveau votre profil visible ou de le
        laisser masqué.
      </p>
      <p className="fr-text--xl fr-text--bold">
        Souhaitez-vous apparaître sur la cartographie&nbsp;?
      </p>
      <ButtonsGroup
        inlineLayoutWhen="md and up"
        buttons={[
          {
            children: 'Oui',
            disabled: enCours,
            onClick: () => repondre('SouhaiteApparaitre'),
          },
          {
            children: 'Non',
            priority: 'secondary',
            disabled: enCours,
            onClick: () => repondre('PrefereResterMasque'),
          },
        ]}
      />
    </div>
  )
}

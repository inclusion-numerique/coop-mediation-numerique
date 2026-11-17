'use client'

import { createToast } from '@app/ui/toast/createToast'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'
import { QUITTER_UNE_EQUIPE_ACTION_KEY } from '../action/quitter-une-equipe.key'

const modale = createModal({
  id: 'leave-team-modal',
  isOpenedByDefault: false,
})

const BoutonQuitterLEquipe = ({
  coordinateurId,
}: {
  coordinateurId: string
}) => {
  const router = useRouter()

  const quitter = async () => {
    const resultat = await inject(QUITTER_UNE_EQUIPE_ACTION_KEY)({
      coordinateurId,
    })

    if (!resultat.success) {
      modale.close()
      createToast({ priority: 'error', message: resultat.error })
      return
    }

    router.push('/coop')
    router.refresh()
  }

  return (
    <>
      <modale.Component
        title="Quitter l’équipe"
        buttons={[
          { children: 'Annuler', priority: 'secondary', onClick: modale.close },
          { children: 'Quitter l’équipe', onClick: quitter },
        ]}
      >
        <span className="fr-display-block fr-mb-6v">
          Êtes-vous sur de vouloir quitter votre équipe&nbsp;?
        </span>
        En quittant cette équipe, votre coordinateur n’aura plus accès à vos
        statistiques et vous ne serez plus référencé comme membre de l’équipe.
      </modale.Component>
      <Button priority="secondary" {...modale.buttonProps}>
        Quitter l’équipe
      </Button>
    </>
  )
}

export default BoutonQuitterLEquipe

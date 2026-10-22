'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { FUSIONNER_DES_COMPTES_ACTION_KEY } from '../action/fusionner-des-comptes.key'
import type { CompteApercu } from '../domain'

const FusionModal = createModal({
  id: 'valider-fusion-modal',
  isOpenedByDefault: false,
})

export const BoutonValiderLaFusion = ({
  source,
  cible,
}: {
  source: CompteApercu
  cible: CompteApercu
}) => {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()

  const fusionner = () =>
    demarrer(async () => {
      const resultat = await inject(FUSIONNER_DES_COMPTES_ACTION_KEY)({
        sourceId: source.id,
        cibleId: cible.id,
      })

      FusionModal.close()

      if (!resultat.success) {
        createToast({ priority: 'error', message: resultat.error })
        return
      }

      createToast({
        priority: 'success',
        message: `L’utilisateur ${source.nom} (${source.courriel}) a bien été fusionné avec ${cible.nom} (${cible.courriel})`,
      })
      router.replace(`/administration/utilisateurs/${cible.id}`)
      router.refresh()
    })

  return (
    <>
      <FusionModal.Component
        title={
          <>
            <span className="fr-icon-git-merge-line" aria-hidden />
            &nbsp; Fusionner des utilisateurs
          </>
        }
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
            onClick: FusionModal.close,
          },
          {
            children: 'Fusionner',
            onClick: fusionner,
            ...buttonLoadingClassname(enCours),
          },
        ]}
      >
        Êtes-vous sûr de vouloir fusionner les utilisateurs suivants&nbsp;?
        <ul className="fr-mb-8v">
          <li>
            {source.nom} - <strong>{source.courriel}</strong>
          </li>
          <li>
            {cible.nom} - <strong>{cible.courriel}</strong>
          </li>
        </ul>
        <p>
          L’utilisateur {source.nom} <strong>{source.courriel}</strong> sera
          supprimé.
        </p>
        <p>
          Toutes ses données, y compris ses connexions ProConnect, seront
          transférées à l’utilisateur {cible.nom}{' '}
          <strong>{cible.courriel}</strong>.
        </p>
        <p>Cette action est irréversible.</p>
      </FusionModal.Component>
      <Button title="Valider la fusion" {...FusionModal.buttonProps}>
        Valider la fusion
      </Button>
    </>
  )
}

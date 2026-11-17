'use client'

import { createToast } from '@app/ui/toast/createToast'
import Card from '@app/web/components/Card'
import { inject } from '@app/web/libs/injection/client'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { ACTIVER_LA_MEDIATION_NUMERIQUE_ACTION_KEY } from '../action/activer-la-mediation-numerique.key'

const ActivationModal = createModal({
  id: 'activate-mediation-numerique-modal',
  isOpenedByDefault: false,
})

export const CarteMediationNumerique = ({ active }: { active: boolean }) => {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()

  const activer = () =>
    demarrer(async () => {
      const resultat = await inject(ACTIVER_LA_MEDIATION_NUMERIQUE_ACTION_KEY)()
      ActivationModal.close()
      if (!resultat.success) {
        createToast({ priority: 'error', message: resultat.error })
        return
      }
      router.refresh()
    })

  return (
    <Card
      noBorder
      className="fr-border fr-border-radius--8"
      titleAs="div"
      title={
        <div className="fr-flex fr-flex-gap-2v fr-align-items-center fr-justify-content-space-between fr-mb-2v fr-width-full">
          <h2 className="fr-text-title--blue-france fr-mb-0 fr-h4">
            Fonctionnalités de médiation numérique
          </h2>
          {active && (
            <Badge className="fr-text--uppercase" severity="success">
              Activé
            </Badge>
          )}
        </div>
      }
      description={
        <>
          <div className="fr-text-mention--grey">
            En tant que coordinateur, vous pouvez également réaliser des
            accompagnements de médiation numérique et profiter des mêmes
            fonctionnalités que les médiateurs numériques (compléter des comptes
            rendus d’activité, suivre vos bénéficiaires...)
          </div>
          {!active && (
            <div className="fr-mt-3w">
              <Button
                title="Je réalise également des accompagnements de médiation numérique"
                type="button"
                priority="secondary"
                {...ActivationModal.buttonProps}
              >
                Activer les fonctionnalités
              </Button>
            </div>
          )}
          <ActivationModal.Component
            title="Activer les fonctionnalités de médiation numérique"
            buttons={[
              {
                type: 'button',
                children: 'Annuler',
                disabled: enCours,
                onClick: ActivationModal.close,
              },
              {
                type: 'button',
                children: 'Activer les fonctionnalités',
                disabled: enCours,
                onClick: activer,
              },
            ]}
          >
            En activant ces fonctionnalités, elles vont venir s’ajouter à votre
            espace coordinateur actuel. Vous ne pourrez plus les désactiver par
            la suite. Êtes-vous sûr de vouloir activer ces fonctionnalités ?
          </ActivationModal.Component>
        </>
      }
    />
  )
}

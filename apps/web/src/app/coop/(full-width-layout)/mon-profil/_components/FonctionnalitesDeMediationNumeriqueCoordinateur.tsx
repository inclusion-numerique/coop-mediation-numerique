'use client'

import Card from '@app/web/components/Card'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'
import React from 'react'

const {
  Component: ActivateMediationNumeriqueModal,
  close: closeActivateMediationNumeriqueModal,
  buttonProps: activateMediationNumeriqueModalNativeButtonProps,
} = createModal({
  id: 'activate-mediation-numerique-modal',
  isOpenedByDefault: false,
})

const FonctionnalitesDeMediationNumeriqueCoordinateur = ({
  isActive,
}: {
  isActive: boolean
}) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const addMediationNumeriqueToCoordinateurMutation =
    trpc.inscription.addMediationNumeriqueToCoordinateur.useMutation()

  const onAddMediationNumerique = async () => {
    setIsLoading(true)
    await addMediationNumeriqueToCoordinateurMutation.mutateAsync().then(() => {
      setIsLoading(false)
      return router.refresh()
    })
  }

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
          {isActive && (
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
          {!isActive && (
            <div className="fr-mt-3w">
              <Button
                title="Je réalise également des accompagnements de médiation numérique"
                type="button"
                priority="secondary"
                {...activateMediationNumeriqueModalNativeButtonProps}
              >
                Activer les fonctionnalités
              </Button>
            </div>
          )}
          <ActivateMediationNumeriqueModal
            title="Activer les fonctionnalités de médiation numérique"
            buttons={[
              {
                type: 'button',
                children: 'Annuler',
                disabled: isLoading,
                onClick: closeActivateMediationNumeriqueModal,
              },
              {
                type: 'button',
                children: 'Activer les fonctionnalités',
                disabled: isLoading,
                onClick: onAddMediationNumerique,
              },
            ]}
          >
            En activant ces fonctionnalités, elles vont venir s’ajouter à votre
            espace coordinateur actuel. Vous ne pourrez plus les désactiver par
            la suite. Êtes-vous sûr de vouloir activer ces fonctionnalités ?
          </ActivateMediationNumeriqueModal>
        </>
      }
    />
  )
}

export default withTrpc(FonctionnalitesDeMediationNumeriqueCoordinateur)

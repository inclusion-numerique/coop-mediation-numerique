'use client'

import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import React from 'react'

const CoordinateurAndMediateur = ({
  horsDispositif,
}: {
  horsDispositif: boolean
}) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const addMediationNumeriqueToCoordinateurMutation =
    trpc.inscription.addMediationNumeriqueToCoordinateur.useMutation()
  const removeMediationNumeriqueFromCoordinateurMutation =
    trpc.inscription.removeMediationNumeriqueFromCoordinateur.useMutation()

  const onSkipMediationNumerique = async () => {
    setIsLoading(true)
    await removeMediationNumeriqueFromCoordinateurMutation.mutateAsync()
    router.push(horsDispositif ? 'structure-employeuse' : 'recapitulatif')
    router.refresh()
  }

  const onAddMediationNumerique = async () => {
    setIsLoading(true)
    await addMediationNumeriqueToCoordinateurMutation.mutateAsync()
    router.push(horsDispositif ? 'structure-employeuse' : 'recapitulatif')
    router.refresh()
  }

  return (
    <div className="fr-btns-group fr-flex fr-direction-row fr-mt-6w">
      <Button
        disabled={isLoading}
        title="J’ai seulment une activité de coordination"
        className="fr-col fr-mb-0"
        priority="secondary"
        onClick={onSkipMediationNumerique}
      >
        Non
      </Button>
      <Button
        disabled={isLoading}
        title="Je réalise des accompagnements de médiation numérique"
        className="fr-col fr-mb-0"
        priority="primary"
        onClick={onAddMediationNumerique}
      >
        Oui
      </Button>
    </div>
  )
}

export default withTrpc(CoordinateurAndMediateur)

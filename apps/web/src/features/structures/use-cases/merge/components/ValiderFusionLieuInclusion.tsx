'use client'

import { createToast } from '@app/ui/toast/createToast'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'

const ValiderFusionLieuInclusion = ({
  sourceStructure,
  targetStructure,
}: {
  sourceStructure: { id: string; nom: string }
  targetStructure: { id: string; nom: string }
}) => {
  const router = useRouter()

  const mutation = trpc.structures.merge.useMutation()

  const {
    Component: ValiderFusionModal,
    close: closeValiderFusionModal,
    buttonProps: validerFusionModalButtonProps,
  } = createModal({
    id: 'valider-fusion-structure-modal',
    isOpenedByDefault: false,
  })

  const handleValiderFusion = async () => {
    try {
      await mutation.mutateAsync({
        sourceStructureId: sourceStructure.id,
        targetStructureId: targetStructure.id,
      })

      createToast({
        priority: 'success',
        message: `Le lieu d’activité "${sourceStructure.nom}" a été fusionné avec "${targetStructure.nom}"`,
      })

      router.replace(
        `/administration/lieux-activite/${targetStructure.id}/modifier`,
      )
      router.refresh()
    } catch {
      createToast({
        priority: 'error',
        message:
          'Une erreur est survenue lors de la fusion. Veuillez réessayer.',
      })
    } finally {
      closeValiderFusionModal()
    }
  }

  return (
    <>
      <ValiderFusionModal
        title={
          <>
            <span className="fr-icon-git-merge-line" aria-hidden />
            &nbsp; Fusionner des structures
          </>
        }
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
            onClick: closeValiderFusionModal,
          },
          {
            children: 'Fusionner',
            onClick: handleValiderFusion,
          },
        ]}
      >
        Êtes-vous sûr de vouloir fusionner les lieux d’activité suivants&nbsp;?
        <ul className="fr-mb-8v">
          <li>
            <strong>{sourceStructure.nom}</strong> (sera supprimé)
          </li>
          <li>
            <strong>{targetStructure.nom}</strong> (conservé)
          </li>
        </ul>
        <p>
          Le lieu d’activité <strong>{sourceStructure.nom}</strong> sera
          définitivement supprimé.
        </p>
        <p>
          Toutes ses données seront transférées au lieu d’activité{' '}
          <strong>{targetStructure.nom}</strong>.
        </p>
        <p className="fr-text--bold fr-text-label--red-marianne">
          Cette action est irréversible.
        </p>
      </ValiderFusionModal>
      <Button title="Valider la fusion" {...validerFusionModalButtonProps}>
        Valider la fusion
      </Button>
    </>
  )
}

export default withTrpc(ValiderFusionLieuInclusion)

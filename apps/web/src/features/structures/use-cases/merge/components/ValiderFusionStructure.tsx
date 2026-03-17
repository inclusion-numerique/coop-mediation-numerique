'use client'

import { createToast } from '@app/ui/toast/createToast'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'

const ValiderFusionStructure = ({
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
        message: `La structure "${sourceStructure.nom}" a été fusionnée avec "${targetStructure.nom}"`,
      })

      router.replace(
        `/administration/structures/${targetStructure.id}/modifier`,
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
        Êtes-vous sûr de vouloir fusionner les structures suivantes&nbsp;?
        <ul className="fr-mb-8v">
          <li>
            <strong>{sourceStructure.nom}</strong> (sera supprimée)
          </li>
          <li>
            <strong>{targetStructure.nom}</strong> (conservée)
          </li>
        </ul>
        <p>
          La structure <strong>{sourceStructure.nom}</strong> sera
          définitivement supprimée.
        </p>
        <p>
          Toutes ses données seront transférées à la structure{' '}
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

export default withTrpc(ValiderFusionStructure)

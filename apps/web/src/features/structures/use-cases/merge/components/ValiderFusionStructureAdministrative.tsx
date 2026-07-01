'use client'

import { createToast } from '@app/ui/toast/createToast'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'

// Confirmation de fusion de deux employeuses. Rendu à l'intérieur d'un parent déjà
// enveloppé par withTrpc (MergeStructureAdministrative) → pas de withTrpc ici.
const ValiderFusionStructureAdministrative = ({
  sourceStructure,
  targetStructure,
}: {
  sourceStructure: { id: string; nom: string }
  targetStructure: { id: string; nom: string }
}) => {
  const router = useRouter()

  const mutation = trpc.structures.mergeAdministrative.useMutation()

  const {
    Component: ValiderFusionModal,
    close: closeValiderFusionModal,
    buttonProps: validerFusionModalButtonProps,
  } = createModal({
    id: 'valider-fusion-structure-administrative-modal',
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
        message: `L'employeuse "${sourceStructure.nom}" a été fusionnée avec "${targetStructure.nom}"`,
      })

      router.replace(
        `/administration/structures-employeuses/${targetStructure.id}`,
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
            &nbsp; Fusionner des employeuses
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
        Êtes-vous sûr de vouloir fusionner ces deux employeuses&nbsp;?
        <ul className="fr-mb-8v">
          <li>
            <strong>{sourceStructure.nom}</strong> (sera supprimée)
          </li>
          <li>
            <strong>{targetStructure.nom}</strong> (conservée)
          </li>
        </ul>
        <p>
          Les emplois et activités-employeur de{' '}
          <strong>{sourceStructure.nom}</strong> seront transférés à{' '}
          <strong>{targetStructure.nom}</strong>, puis la source sera
          définitivement supprimée.
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

export default ValiderFusionStructureAdministrative

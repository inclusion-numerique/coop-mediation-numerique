'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'
import { hrefDeModificationDuLieu } from '@/features/lieux-activite/ui/presenters/href-du-lieu.presenter'
import { inject } from '@/libraries/nextjs/injection'
import { createToast } from '@/libraries/ui/toast'
import { FUSIONNER_DES_LIEUX_ACTION_KEY } from '../../action/fusionner-des-lieux.key'

const ValiderLaFusion = ({
  sourceStructure,
  targetStructure,
}: {
  sourceStructure: { id: string; nom: string }
  targetStructure: { id: string; nom: string }
}) => {
  const router = useRouter()

  const {
    Component: ValiderFusionModal,
    close: closeValiderFusionModal,
    buttonProps: validerFusionModalButtonProps,
  } = createModal({
    id: 'valider-fusion-structure-modal',
    isOpenedByDefault: false,
  })

  const echec = () =>
    createToast({
      priority: 'error',
      message: 'Une erreur est survenue lors de la fusion. Veuillez réessayer.',
    })

  const handleValiderFusion = async () => {
    try {
      const resultat = await inject(FUSIONNER_DES_LIEUX_ACTION_KEY)({
        sourceStructureId: sourceStructure.id,
        targetStructureId: targetStructure.id,
      })

      if (!resultat.success) {
        echec()
        return
      }

      createToast({
        priority: 'success',
        message: `Le lieu d’activité "${sourceStructure.nom}" a été fusionné avec "${targetStructure.nom}"`,
      })

      router.replace(hrefDeModificationDuLieu(targetStructure.id))
      router.refresh()
    } catch {
      echec()
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

export default ValiderLaFusion

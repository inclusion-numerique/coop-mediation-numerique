'use client'

import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { inject } from '@app/web/libs/injection/client'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { TagAffiche } from '../../../ui'
import { SUPPRIMER_UN_TAG_ACTION_KEY } from '../action/supprimer-un-tag.key'
import { texteDeSuppression } from './suppression.presenter'

export const SuppressionDuTag = createDynamicModal<TagAffiche | null>({
  id: 'delete-tag-modal',
  isOpenedByDefault: false,
  initialState: null,
})

export const ModaleDeSuppression = () => {
  const tag = SuppressionDuTag.useState()
  const [enCours, setEnCours] = useState(false)
  const router = useRouter()

  const texte = tag === null ? null : texteDeSuppression(tag.portee, tag.nom)

  if (tag === null || texte === null) return null

  const supprimer = async () => {
    if (enCours) return

    setEnCours(true)
    const resultat = await inject(SUPPRIMER_UN_TAG_ACTION_KEY)({
      tagId: tag.id,
    })
    setEnCours(false)

    if (!resultat.success) {
      createToast({
        priority: 'error',
        message: 'Une erreur est survenue lors de la suppression du tag.',
      })
      return
    }

    SuppressionDuTag.close()
    createToast({
      priority: 'success',
      message: `Le tag ${tag.nom} a bien été supprimé`,
    })
    router.refresh()
  }

  return (
    <SuppressionDuTag.Component
      title={texte.titre}
      buttons={[
        {
          children: 'Annuler',
          priority: 'secondary',
          disabled: enCours,
          type: 'button',
        },
        {
          children: 'Supprimer',
          ...buttonLoadingClassname(enCours),
          nativeButtonProps: { className: 'fr-btn--danger' },
          doClosesModal: false,
          onClick: supprimer,
        },
      ]}
    >
      <p>{texte.description}</p>
      <Notice
        severity="warning"
        title={
          <span className="fr-text-default--grey fr-text--regular fr-ml-2v">
            La suppression du tag est définitive.
          </span>
        }
      />
    </SuppressionDuTag.Component>
  )
}

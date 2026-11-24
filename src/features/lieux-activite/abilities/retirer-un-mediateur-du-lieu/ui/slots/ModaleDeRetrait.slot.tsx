'use client'

import Notice from '@codegouvfr/react-dsfr/Notice'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { formatDate } from '@/libraries/date/format-date'
import { inject } from '@/libraries/nextjs/injection/client'
import { createToast } from '@/libraries/ui/toast/create-toast'
import { buttonLoadingClassname } from '@/libraries/ui/utils/button-loading-classname'
import { RETIRER_UN_MEDIATEUR_DU_LIEU_ACTION_KEY } from '../../action/retirer-un-mediateur-du-lieu.key'
import { ModaleDeRetraitDynamique } from '../components/ModaleDeRetraitDynamique'

const ModaleDeRetrait = () => {
  const {
    mediateurId,
    structureId,
    mediateurDisplayName,
    structureNom,
    derniereActiviteDate,
    variant,
  } = ModaleDeRetraitDynamique.useState()

  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleConfirm = async () => {
    if (isPending) return

    setIsPending(true)
    const resultat = await inject(RETIRER_UN_MEDIATEUR_DU_LIEU_ACTION_KEY)({
      mediateurId,
      lieuId: structureId,
    })
    setIsPending(false)

    if (!resultat.success) {
      createToast({ priority: 'error', message: resultat.error })
      return
    }

    ModaleDeRetraitDynamique.close()

    createToast({
      priority: 'success',
      message:
        variant === 'mediateur'
          ? `${mediateurDisplayName} a bien été retiré du lieu ${structureNom}.`
          : `${structureNom} a bien été retiré de votre liste de lieux d’activité.`,
    })

    router.refresh()
  }

  const formattedDate = derniereActiviteDate
    ? formatDate(new Date(derniereActiviteDate), 'dd.MM.yyyy')
    : null

  return (
    <ModaleDeRetraitDynamique.Component
      title={
        variant === 'mediateur'
          ? `Retirer ${mediateurDisplayName} du lieu ${structureNom} ?`
          : `Retirer ${structureNom} de votre liste`
      }
      buttons={[
        {
          children: 'Annuler',
          priority: 'secondary',
          disabled: isPending,
          type: 'button',
        },
        {
          children: variant === 'mediateur' ? 'Retirer du lieu' : 'Retirer',
          type: 'button',
          onClick: handleConfirm,
          ...buttonLoadingClassname(
            isPending,
            variant === 'mediateur' ? undefined : 'fr-btn--danger',
          ),
          doClosesModal: false,
        },
      ]}
    >
      <p className="fr-mb-4v">
        {variant === 'mediateur' ? (
          <>
            Êtes-vous sûr que {mediateurDisplayName} ne travaille plus dans ce
            lieu ? Il sera notifié par email que vous l'avez retiré de ce lieu
            d’activité.
          </>
        ) : (
          <>
            Êtes-vous sûr de vouloir retirer ce lieu de votre liste de lieux
            d’activité ?
          </>
        )}
      </p>
      {variant === 'mediateur' && (
        <Notice
          className="fr-notice--info fr-notice--flex fr-align-items-center fr-my-4v"
          title={
            <span className="fr-text-default--grey fr-text--regular">
              {formattedDate ? (
                <>
                  Date de la dernière activité enregistrée par{' '}
                  {mediateurDisplayName} sur ce lieu&nbsp;: {formattedDate}
                </>
              ) : (
                <>
                  Aucune activité enregistrée par {mediateurDisplayName} sur ce
                  lieu
                </>
              )}
            </span>
          }
        />
      )}
    </ModaleDeRetraitDynamique.Component>
  )
}

export default ModaleDeRetrait

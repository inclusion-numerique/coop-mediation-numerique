'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import { formatDate } from '@app/web/utils/formatDate'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useRouter } from 'next/navigation'
import React from 'react'
import { RemoveMediateurFromLieuDynamicModal } from './RemoveMediateurFromLieuDynamicModal'

const RemoveMediateurFromLieuModal = () => {
  const {
    mediateurId,
    structureId,
    mediateurDisplayName,
    structureNom,
    derniereActiviteDate,
  } = RemoveMediateurFromLieuDynamicModal.useState()

  const router = useRouter()
  const mutation = trpc.lieuActivite.removeMediateurFromLieu.useMutation()
  const isPending = mutation.isPending

  const handleConfirm = async () => {
    if (isPending) return

    try {
      await mutation.mutateAsync({
        mediateurId,
        structureId,
      })

      RemoveMediateurFromLieuDynamicModal.close()

      createToast({
        priority: 'success',
        message: `${mediateurDisplayName} a bien été retiré du lieu ${structureNom}.`,
      })

      router.refresh()
    } catch {
      createToast({
        priority: 'error',
        message: 'Une erreur est survenue lors du retrait du médiateur.',
      })
    }
  }

  const formattedDate = derniereActiviteDate
    ? formatDate(new Date(derniereActiviteDate), 'dd.MM.yyyy')
    : null

  return (
    <RemoveMediateurFromLieuDynamicModal.Component
      title={`Retirer ${mediateurDisplayName} du lieu ${structureNom} ?`}
      buttons={[
        {
          children: 'Annuler',
          priority: 'secondary',
          disabled: isPending,
          type: 'button',
        },
        {
          children: 'Retirer du lieu',
          type: 'button',
          onClick: handleConfirm,
          ...buttonLoadingClassname(isPending),
          doClosesModal: false,
        },
      ]}
    >
      <p className="fr-mb-4v">
        Êtes-vous sur que {mediateurDisplayName} ne travaille plus dans ce
        lieu ? Il sera notifié par email que vous l'avez retiré de ce lieu
        d’activité.
      </p>
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
    </RemoveMediateurFromLieuDynamicModal.Component>
  )
}

export default withTrpc(RemoveMediateurFromLieuModal)

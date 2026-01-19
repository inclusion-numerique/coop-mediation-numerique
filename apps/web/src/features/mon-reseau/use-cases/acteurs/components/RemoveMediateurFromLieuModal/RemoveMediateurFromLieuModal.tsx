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
    variant,
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
        message:
          variant === 'mediateur'
            ? `${mediateurDisplayName} a bien été retiré du lieu ${structureNom}.`
            : `${structureNom} a bien été retiré de votre liste de lieux d’activité.`,
      })

      router.refresh()
    } catch {
      createToast({
        priority: 'error',
        message:
          variant === 'mediateur'
            ? 'Une erreur est survenue lors du retrait du médiateur.'
            : 'Une erreur est survenue lors du retrait du lieu.',
      })
    }
  }

  const formattedDate = derniereActiviteDate
    ? formatDate(new Date(derniereActiviteDate), 'dd.MM.yyyy')
    : null

  return (
    <RemoveMediateurFromLieuDynamicModal.Component
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
            Êtes-vous sur que {mediateurDisplayName} ne travaille plus dans ce
            lieu ? Il sera notifié par email que vous l'avez retiré de ce lieu
            d’activité.
          </>
        ) : (
          <>
            Êtes-vous sûr de vouloir supprimer ce lieu de votre liste de lieux
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
    </RemoveMediateurFromLieuDynamicModal.Component>
  )
}

export default withTrpc(RemoveMediateurFromLieuModal)

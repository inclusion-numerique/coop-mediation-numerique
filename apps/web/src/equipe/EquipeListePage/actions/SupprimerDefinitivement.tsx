'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)

const SupprimerDefinitivementComponent = ({
  mediateurId,
  coordinateurId,
  displayName,
  archivedFrom,
  archivedTo,
}: {
  mediateurId: string
  coordinateurId: string
  displayName: string
  archivedFrom: Date
  archivedTo: Date
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  const {
    Component: DeleteFromArchiveModal,
    close: closeDeleteFromArchiveModal,
    buttonProps: deleteFromArchiveModalNativeButtonProps,
  } = createModal({
    id: `delete-from-archive-modal-${mediateurId}`,
    isOpenedByDefault: false,
  })

  const router = useRouter()
  const deleteFromArchiveMutation =
    trpc.mediateur.deleteFromArchive.useMutation()

  const onDeleteFromArchive = async () => {
    try {
      await deleteFromArchiveMutation.mutateAsync({
        mediateurId,
        coordinateurId,
      })
      closeDeleteFromArchiveModal()
      router.refresh()
      createToast({
        priority: 'success',
        message: `${displayName} a bien été supprimé définitivement de vos archives`,
      })
    } catch {
      closeDeleteFromArchiveModal()
      createToast({
        priority: 'error',
        message: `Une erreur est survenue lors de la suppression, veuillez réessayer ultérieurement.`,
      })
    }
  }

  return (
    <>
      {isMounted &&
        createPortal(
          <DeleteFromArchiveModal
            title={`Supprimer définitivement '${displayName}' de vos archives`}
            buttons={[
              {
                children: 'Annuler',
                priority: 'secondary',
                onClick: closeDeleteFromArchiveModal,
              },
              {
                children: 'Supprimer définitivement',
                onClick: onDeleteFromArchive,
                ...buttonLoadingClassname(deleteFromArchiveMutation.isPending),
              },
            ]}
          >
            Êtes-vous sûr de vouloir supprimer définitivement '{displayName}' de
            vos archives&nbsp;?
            <Notice
              className="fr-notice--flex fr-mt-4v fr-notice--warning"
              title={
                <span className="fr-text--left fr-text-default--grey fr-text--regular">
                  Vous n'aurez plus accès à ses activités et ses statistiques
                  archivés{' '}
                  <b>
                    du {formatDate(archivedFrom)} au {formatDate(archivedTo)}.
                  </b>
                </span>
              }
            />
          </DeleteFromArchiveModal>,
          document.body,
        )}
      <Button
        title="Supprimer définitivement ce membre de mon équipe"
        size="small"
        priority="tertiary"
        {...deleteFromArchiveModalNativeButtonProps}
        {...buttonLoadingClassname(
          deleteFromArchiveMutation.isPending ||
            deleteFromArchiveMutation.isSuccess,
          'fr-text-default--error fr-position-relative fr-index-10',
        )}
      >
        <span className="ri-delete-bin-line" aria-hidden />
      </Button>
    </>
  )
}

export const SupprimerDefinitivement = withTrpc(
  SupprimerDefinitivementComponent,
)

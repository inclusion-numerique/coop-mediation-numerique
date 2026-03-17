'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const {
  Component: DeleteUserModal,
  close: closeDeleteUserModal,
  buttonProps: deleteUserModalNativeButtonProps,
} = createModal({
  id: 'admin-delete-user-modal',
  isOpenedByDefault: false,
})

const DeleteUserButtonComponent = ({
  userId,
  userName,
}: {
  userId: string
  userName: string
}) => {
  const router = useRouter()
  const mutation = trpc.user.adminDeleteUser.useMutation()
  const [confirmation, setConfirmation] = useState('')

  const isConfirmed = confirmation.trim().toLowerCase() === 'oui'

  const onDelete = async () => {
    if (!isConfirmed) return

    try {
      await mutation.mutateAsync({ userId })
      closeDeleteUserModal()
      createToast({
        priority: 'success',
        message: `L'utilisateur ${userName} a été supprimé`,
      })
      router.refresh()
    } catch {
      createToast({
        priority: 'error',
        message:
          'Erreur lors de la suppression, veuillez réessayer ou contacter le support',
      })
    }
  }

  return (
    <>
      <DeleteUserModal
        title="Supprimer l'utilisateur"
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
            onClick: () => {
              setConfirmation('')
              closeDeleteUserModal()
            },
          },
          {
            children: 'Supprimer',
            disabled: !isConfirmed,
            onClick: onDelete,
            ...buttonLoadingClassname(mutation.isPending, 'fr-btn--danger'),
          },
        ]}
      >
        <p>
          Êtes-vous sûr de vouloir supprimer le compte de{' '}
          <strong>{userName}</strong>&nbsp;? Cette action est irréversible et
          entraîne la suppression définitive du profil.
        </p>
        <label className="fr-label" htmlFor="delete-user-confirmation">
          Écrivez "oui" dans le champ ci-dessous pour confirmer
        </label>
        <input
          id="delete-user-confirmation"
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="fr-input"
          aria-label="Confirmation de suppression"
        />
      </DeleteUserModal>
      <Button
        type="button"
        iconId="fr-icon-delete-line"
        size="small"
        className="fr-btn--danger"
        nativeButtonProps={deleteUserModalNativeButtonProps}
      >
        Supprimer
      </Button>
    </>
  )
}

export default withTrpc(DeleteUserButtonComponent)

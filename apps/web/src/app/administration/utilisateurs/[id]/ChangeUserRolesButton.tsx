'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

const {
  Component: ChangeRolesModal,
  close: closeChangeRolesModal,
  buttonProps: changeRolesModalNativeButtonProps,
} = createModal({
  id: 'change-roles-modal',
  isOpenedByDefault: false,
})

const ChangeUserRolesComponent = ({
  userId,
  currentIsMediateur,
  currentIsCoordinateur,
  canRemoveMediateur,
  canRemoveCoordinateur,
}: {
  userId: string
  currentIsMediateur: boolean
  currentIsCoordinateur: boolean
  canRemoveMediateur: boolean
  canRemoveCoordinateur: boolean
}) => {
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const mutation = trpc.user.changeRoles.useMutation()

  const onConfirm = async () => {
    const formData = new FormData(formRef.current!)
    const isMediateur = formData.has('isMediateur')
    const isCoordinateur = formData.has('isCoordinateur')

    if (!isMediateur && !isCoordinateur) {
      createToast({
        priority: 'error',
        message: 'Au moins un rôle doit être sélectionné',
      })
      return
    }

    try {
      await mutation.mutateAsync({ userId, isMediateur, isCoordinateur })
      closeChangeRolesModal()
      router.refresh()
      createToast({
        priority: 'success',
        message: 'Les rôles ont été mis à jour avec succès',
      })
    } catch {
      createToast({
        priority: 'error',
        message:
          'Erreur lors du changement de rôle, veuillez réessayer ou contacter le support',
      })
    }
  }

  return (
    <>
      <ChangeRolesModal
        title="Changer de rôle"
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
            onClick: closeChangeRolesModal,
          },
          {
            children: 'Valider',
            onClick: onConfirm,
            ...buttonLoadingClassname(mutation.isPending),
          },
        ]}
      >
        <form ref={formRef}>
          <fieldset className="fr-fieldset">
            <div className="fr-fieldset__element">
              <div className="fr-checkbox-group">
                {currentIsMediateur && !canRemoveMediateur && (
                  <input type="hidden" name="isMediateur" value="on" />
                )}
                <input
                  type="checkbox"
                  id="role-mediateur"
                  name="isMediateur"
                  defaultChecked={currentIsMediateur}
                  disabled={currentIsMediateur && !canRemoveMediateur}
                />
                <label className="fr-label" htmlFor="role-mediateur">
                  Médiateur
                  {currentIsMediateur && !canRemoveMediateur && (
                    <span className="fr-hint-text">
                      Impossible de retirer ce rôle : des bénéficiaires ou
                      activités existent
                    </span>
                  )}
                </label>
              </div>
            </div>
            <div className="fr-fieldset__element">
              <div className="fr-checkbox-group">
                {currentIsCoordinateur && !canRemoveCoordinateur && (
                  <input type="hidden" name="isCoordinateur" value="on" />
                )}
                <input
                  type="checkbox"
                  id="role-coordinateur"
                  name="isCoordinateur"
                  defaultChecked={currentIsCoordinateur}
                  disabled={currentIsCoordinateur && !canRemoveCoordinateur}
                />
                <label className="fr-label" htmlFor="role-coordinateur">
                  Coordinateur
                  {currentIsCoordinateur && !canRemoveCoordinateur && (
                    <span className="fr-hint-text">
                      Impossible de retirer ce rôle : des médiateurs sont encore
                      coordonnés
                    </span>
                  )}
                </label>
              </div>
            </div>
          </fieldset>
        </form>
      </ChangeRolesModal>
      <Button
        type="button"
        iconId="fr-icon-user-setting-line"
        size="small"
        priority="secondary"
        nativeButtonProps={changeRolesModalNativeButtonProps}
      >
        Changer de rôle
      </Button>
    </>
  )
}

export default withTrpc(ChangeUserRolesComponent)

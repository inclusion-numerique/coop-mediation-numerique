'use client'

import { supprimerMonCompteAction } from '@app/web/app/_actions/utilisateurs/supprimer-mon-compte.action'
import Card from '@app/web/components/Card'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import * as Sentry from '@sentry/nextjs'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

const {
  Component: DeleteProfile,
  close: closeDeleteProfile,
  buttonProps: deleteProfileNativeButtonProps,
} = createModal({
  id: 'delete-profile-modal',
  isOpenedByDefault: false,
})

const ProfileDeleteCard = () => {
  const [deleteProfileConfirmation, setDeleteProfileConfirmation] = useState('')

  const isDeleteConfirmed =
    deleteProfileConfirmation.trim().toLowerCase() === 'oui'

  const deleteProfile = async () => {
    if (!isDeleteConfirmed) return

    const result = await supprimerMonCompteAction()

    if (!result.success) {
      Sentry.captureException(new Error(result.error))
      return
    }

    await signOut()
  }
  return (
    <>
      <Card
        title={
          <span className="fr-text-title--blue-france">
            Supprimer votre compte
          </span>
        }
        titleAs="h2"
        noBorder
        className="fr-border fr-border-radius--8"
        id="delete-account"
      >
        <div className="fr-flex fr-direction-md-row fr-direction-column fr-flex-gap-4v">
          <div>
            Cette action est irréversible et entraîne la suppression définitive
            de votre profil. Utilisez cette fonction avec précaution.
          </div>
          <div>
            <Button
              className="fr-btn--danger"
              data-testid="open-delete-profile-modal"
              title="Supprimer"
              {...deleteProfileNativeButtonProps}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Card>
      <DeleteProfile
        title="Supprimer le profil"
        buttons={[
          {
            type: 'button',
            children: 'Annuler',
            onClick: closeDeleteProfile,
          },
          {
            type: 'button',
            children: 'Supprimer',
            className: 'fr-btn--danger',
            disabled: !isDeleteConfirmed,
            onClick: deleteProfile,
          },
        ]}
      >
        <p>
          Êtes-vous sûr de vouloir supprimer votre profil ? Cette action est
          irréversible et entraîne la suppression définitive de votre profil.
        </p>
        <label className="fr-label" htmlFor="delete-profile-confirmation">
          Écrivez “oui” dans le champ ci-dessous
        </label>
        <input
          id="delete-profile-confirmation"
          type="text"
          value={deleteProfileConfirmation}
          onChange={(e) => setDeleteProfileConfirmation(e.target.value)}
          className="fr-input"
          aria-label="Confirmation de suppression"
        />
      </DeleteProfile>
    </>
  )
}

export default ProfileDeleteCard

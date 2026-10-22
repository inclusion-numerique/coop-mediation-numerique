'use client'

import { createToast } from '@app/ui/toast/createToast'
import Card from '@app/web/components/Card'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { signOut } from 'next-auth/react'
import { useState, useTransition } from 'react'
import { SUPPRIMER_MON_COMPTE_ACTION_KEY } from '../action/supprimer-compte.key'

const SuppressionModal = createModal({
  id: 'delete-profile-modal',
  isOpenedByDefault: false,
})

export const CarteSupprimerMonCompte = () => {
  const [enCours, demarrer] = useTransition()
  const [confirmation, setConfirmation] = useState('')
  const estConfirme = confirmation.trim().toLowerCase() === 'oui'

  const supprimer = () =>
    demarrer(async () => {
      if (!estConfirme) return

      const resultat = await inject(SUPPRIMER_MON_COMPTE_ACTION_KEY)()

      if (!resultat.success) {
        SuppressionModal.close()
        createToast({ priority: 'error', message: resultat.error })
        return
      }

      await signOut()
    })

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
              {...SuppressionModal.buttonProps}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Card>
      <SuppressionModal.Component
        title="Supprimer le profil"
        buttons={[
          {
            type: 'button',
            children: 'Annuler',
            onClick: SuppressionModal.close,
          },
          {
            type: 'button',
            children: 'Supprimer',
            className: 'fr-btn--danger',
            disabled: !estConfirme || enCours,
            onClick: supprimer,
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
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className="fr-input"
          aria-label="Confirmation de suppression"
        />
      </SuppressionModal.Component>
    </>
  )
}

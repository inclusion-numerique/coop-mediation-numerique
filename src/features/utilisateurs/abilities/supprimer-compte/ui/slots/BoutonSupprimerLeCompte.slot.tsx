'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { inject } from '@/libraries/nextjs/injection'
import { createToast } from '@/libraries/ui/toast'
import { buttonLoadingClassname } from '@/libraries/ui/utils'
import { SUPPRIMER_LE_COMPTE_ACTION_KEY } from '../../action/supprimer-compte.key'

const SuppressionModal = createModal({
  id: 'admin-delete-user-modal',
  isOpenedByDefault: false,
})

export const BoutonSupprimerLeCompte = ({
  utilisateurId,
  nom,
}: {
  utilisateurId: string
  nom: string
}) => {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()
  const [confirmation, setConfirmation] = useState('')
  const estConfirme = confirmation.trim().toLowerCase() === 'oui'

  const supprimer = () =>
    demarrer(async () => {
      if (!estConfirme) return

      const resultat = await inject(SUPPRIMER_LE_COMPTE_ACTION_KEY)({
        utilisateurId,
      })

      if (!resultat.success) {
        createToast({ priority: 'error', message: resultat.error })
        return
      }

      SuppressionModal.close()
      createToast({
        priority: 'success',
        message: `L'utilisateur ${nom} a été supprimé`,
      })
      router.refresh()
    })

  return (
    <>
      <SuppressionModal.Component
        title="Supprimer l'utilisateur"
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
            onClick: () => {
              setConfirmation('')
              SuppressionModal.close()
            },
          },
          {
            children: 'Supprimer',
            disabled: !estConfirme,
            onClick: supprimer,
            ...buttonLoadingClassname(enCours, 'fr-btn--danger'),
          },
        ]}
      >
        <p>
          Êtes-vous sûr de vouloir supprimer le compte de <strong>{nom}</strong>
          &nbsp;? Cette action est irréversible et entraîne la suppression
          définitive du profil.
        </p>
        <label className="fr-label" htmlFor="delete-user-confirmation">
          Écrivez "oui" dans le champ ci-dessous pour confirmer
        </label>
        <input
          id="delete-user-confirmation"
          type="text"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className="fr-input"
          aria-label="Confirmation de suppression"
        />
      </SuppressionModal.Component>
      <Button
        type="button"
        iconId="fr-icon-delete-line"
        size="small"
        className="fr-btn--danger"
        nativeButtonProps={SuppressionModal.buttonProps}
      >
        Supprimer
      </Button>
    </>
  )
}

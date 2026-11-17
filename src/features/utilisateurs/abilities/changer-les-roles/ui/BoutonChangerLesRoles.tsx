'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { CHANGER_LES_ROLES_ACTION_KEY } from '../action/changer-les-roles.key'

const RolesModal = createModal({
  id: 'change-roles-modal',
  isOpenedByDefault: false,
})

type EtatDuRole = {
  readonly actuel: boolean
  readonly retirable: boolean
}

const CaseDuRole = ({
  id,
  libelle,
  etat,
  coche,
  indice,
  surChangement,
}: {
  id: string
  libelle: string
  etat: EtatDuRole
  coche: boolean
  indice: string
  surChangement: (coche: boolean) => void
}) => {
  const verrouille = etat.actuel && !etat.retirable

  return (
    <div className="fr-fieldset__element">
      <div className="fr-checkbox-group">
        <input
          type="checkbox"
          id={id}
          checked={coche}
          disabled={verrouille}
          onChange={(event) => surChangement(event.target.checked)}
        />
        <label className="fr-label" htmlFor={id}>
          {libelle}
          {verrouille && <span className="fr-hint-text">{indice}</span>}
        </label>
      </div>
    </div>
  )
}

export const BoutonChangerLesRoles = ({
  utilisateurId,
  mediateur,
  coordinateur,
}: {
  utilisateurId: string
  mediateur: EtatDuRole
  coordinateur: EtatDuRole
}) => {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()
  const [estMediateur, setEstMediateur] = useState(mediateur.actuel)
  const [estCoordinateur, setEstCoordinateur] = useState(coordinateur.actuel)

  const valider = () =>
    demarrer(async () => {
      const resultat = await inject(CHANGER_LES_ROLES_ACTION_KEY)({
        utilisateurId,
        mediateur: estMediateur,
        coordinateur: estCoordinateur,
      })

      if (!resultat.success) {
        createToast({ priority: 'error', message: resultat.error })
        return
      }

      RolesModal.close()
      router.refresh()
      createToast({
        priority: 'success',
        message: 'Les rôles ont été mis à jour avec succès',
      })
    })

  return (
    <>
      <RolesModal.Component
        title="Changer de rôle"
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
            onClick: RolesModal.close,
          },
          {
            children: 'Valider',
            onClick: valider,
            ...buttonLoadingClassname(enCours),
          },
        ]}
      >
        <fieldset className="fr-fieldset">
          <CaseDuRole
            id="role-mediateur"
            libelle="Médiateur"
            etat={mediateur}
            coche={estMediateur}
            indice="Impossible de retirer ce rôle : des bénéficiaires ou activités existent"
            surChangement={setEstMediateur}
          />
          <CaseDuRole
            id="role-coordinateur"
            libelle="Coordinateur"
            etat={coordinateur}
            coche={estCoordinateur}
            indice="Impossible de retirer ce rôle : il porte une équipe, des invitations ou des activités de coordination"
            surChangement={setEstCoordinateur}
          />
        </fieldset>
      </RolesModal.Component>
      <Button
        type="button"
        iconId="fr-icon-user-setting-line"
        size="small"
        priority="secondary"
        nativeButtonProps={RolesModal.buttonProps}
      >
        Changer de rôle
      </Button>
    </>
  )
}

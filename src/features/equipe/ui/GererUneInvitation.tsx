'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { inject } from '@app/web/libs/injection/client'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ANNULER_UNE_INVITATION_ACTION_KEY } from '../abilities/annuler-une-invitation/action/annuler-une-invitation.key'
import { RELANCER_UNE_INVITATION_ACTION_KEY } from '../abilities/relancer-une-invitation/action/relancer-une-invitation.key'

type EnCours = 'aucune' | 'annulation' | 'relance'

const GererUneInvitation = ({
  email,
  coordinateurId,
  envoyeeLe,
}: {
  email: string
  coordinateurId: string
  envoyeeLe: Date
}) => {
  const [estMonte, setEstMonte] = useState(false)
  const [enCours, setEnCours] = useState<EnCours>('aucune')
  const router = useRouter()

  useEffect(() => setEstMonte(true), [])

  const {
    Component: Modale,
    close,
    buttonProps,
  } = createModal({
    id: `invitation-modal-${email}`,
    isOpenedByDefault: false,
  })

  const executer = async (
    action: Exclude<EnCours, 'aucune'>,
    succes: string,
  ) => {
    setEnCours(action)
    const resultat = await inject(
      action === 'annulation'
        ? ANNULER_UNE_INVITATION_ACTION_KEY
        : RELANCER_UNE_INVITATION_ACTION_KEY,
    )({ email, coordinateurId })
    setEnCours('aucune')
    close()

    if (!resultat.success) {
      createToast({ priority: 'error', message: resultat.error })
      return
    }

    router.refresh()
    createToast({ priority: 'success', message: succes })
  }

  return (
    <>
      {estMonte &&
        createPortal(
          <Modale
            title={`Invitation envoyée le ${dateAsDay(envoyeeLe)}`}
            buttons={[
              {
                children: "Supprimer l'invitation",
                priority: 'primary',
                onClick: () =>
                  executer(
                    'annulation',
                    `L'invitation pour ${email} a bien été supprimée`,
                  ),
                ...buttonLoadingClassname(
                  enCours === 'annulation',
                  'fr-btn--danger',
                ),
              },
              {
                children: "Relancer l'invitation",
                onClick: () =>
                  executer(
                    'relance',
                    `L'invitation pour ${email} a bien été renvoyée`,
                  ),
                iconId: 'fr-icon-mail-line',
                iconPosition: 'right',
                ...buttonLoadingClassname(enCours === 'relance'),
              },
            ]}
          >
            <p className="fr-text-mention--grey fr-mb-0">
              Adresse électronique
            </p>
            <p className="fr-text--bold fr-mb-0">{email}</p>
          </Modale>,
          document.body,
        )}
      <Button
        title="Gérer l'invitation"
        size="small"
        priority="tertiary"
        {...buttonProps}
        {...buttonLoadingClassname(
          enCours !== 'aucune',
          'fr-position-relative fr-index-10',
        )}
      >
        <span className="ri-mail-settings-line" aria-hidden />
      </Button>
    </>
  )
}

export default GererUneInvitation

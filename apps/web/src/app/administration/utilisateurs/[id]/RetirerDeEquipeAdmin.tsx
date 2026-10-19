'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { RETIRER_UN_MEMBRE_ACTION_KEY } from '@app/web/features/equipe/abilities/retirer-un-membre/action/retirer-un-membre.key'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const RetirerDeEquipeAdminComponent = ({
  mediateurId,
  coordinateurId,
  displayName,
}: {
  mediateurId: string
  coordinateurId: string
  displayName: string
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  const {
    Component: RemoveFromTeamModal,
    close: closeRemoveFromTeamModal,
    buttonProps: removeFromTeamModalNativeButtonProps,
  } = createModal({
    id: `remove-from-team-modal-${mediateurId}`,
    isOpenedByDefault: false,
  })

  const router = useRouter()
  const [etat, setEtat] = useState<'aucun' | 'en-cours' | 'fait'>('aucun')

  const onRemoveFromTeam = async () => {
    setEtat('en-cours')
    const resultat = await inject(RETIRER_UN_MEMBRE_ACTION_KEY)({
      mediateurId,
      coordinateurId,
    })
    closeRemoveFromTeamModal()

    if (!resultat.success) {
      setEtat('aucun')
      createToast({ priority: 'error', message: resultat.error })
      return
    }

    setEtat('fait')
    router.refresh()
    createToast({
      priority: 'success',
      message: `${displayName} a bien été retiré de l'équipe`,
    })
  }

  return (
    <>
      {isMounted &&
        createPortal(
          <RemoveFromTeamModal
            title={`Retirer '${displayName}' de l'équipe`}
            buttons={[
              {
                children: 'Annuler',
                priority: 'secondary',
                onClick: closeRemoveFromTeamModal,
              },
              {
                children: "Retirer de l'équipe",
                onClick: onRemoveFromTeam,
                ...buttonLoadingClassname(etat === 'en-cours'),
              },
            ]}
          >
            Êtes-vous sûr de vouloir retirer '{displayName}' de l'équipe&nbsp;?
            <Notice
              className="fr-notice--flex fr-mt-4v"
              title={
                <span className="fr-text--left fr-text-default--grey fr-text--regular">
                  Le coordinateur n'aura plus accès aux prochaines activités et
                  statistiques enregistrés{' '}
                  <b>
                    à partir du moment où '{displayName}' sera retiré de
                    l'équipe.
                  </b>
                  <br />
                  <br />
                  Il conservera uniquement l'accès aux activités et statistiques
                  archivés <b>jusqu'à ce jour.</b>
                </span>
              }
            />
          </RemoveFromTeamModal>,
          document.body,
        )}
      <Button
        title="Retirer ce membre de l'équipe"
        size="small"
        priority="tertiary"
        {...removeFromTeamModalNativeButtonProps}
        {...buttonLoadingClassname(
          etat !== 'aucun',
          'fr-text-default--error fr-position-relative fr-index-10',
        )}
      >
        <span className="ri-user-unfollow-line" aria-hidden />
      </Button>
    </>
  )
}

export const RetirerDeEquipeAdmin = RetirerDeEquipeAdminComponent

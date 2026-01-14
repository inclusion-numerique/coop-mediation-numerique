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

const RetirerDeMonEquipeComponent = ({
  mediateurId,
  displayName,
}: {
  mediateurId: string
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
  const removeFromTeamMutation = trpc.mediateur.removeFromTeam.useMutation()

  const onRemoveFromTeam = async () => {
    try {
      await removeFromTeamMutation.mutateAsync({ mediateurId })
      closeRemoveFromTeamModal()
      router.refresh()
      createToast({
        priority: 'success',
        message: `${displayName} a bien été retiré de votre équipe`,
      })
    } catch {
      closeRemoveFromTeamModal()
      createToast({
        priority: 'error',
        message: `Une erreur est survenue lors de la suppression de ${displayName} de votre équipe, veuillez réessayer ultérieurement.`,
      })
    }
  }

  return (
    <>
      {isMounted &&
        createPortal(
          <RemoveFromTeamModal
            title={`Retirer '${displayName}' de mon équipe`}
            buttons={[
              {
                children: 'Annuler',
                priority: 'secondary',
                onClick: closeRemoveFromTeamModal,
              },
              {
                children: 'Retirer de mon équipe',
                onClick: onRemoveFromTeam,
                ...buttonLoadingClassname(removeFromTeamMutation.isPending),
              },
            ]}
          >
            Êtes-vous sûr de vouloir retirer ‘{displayName}’ de votre
            équipe&nbsp;?
            <Notice
              className="fr-notice--flex fr-mt-4v"
              title={
                <span className="fr-text--left fr-text-default--grey fr-text--regular">
                  Vous n’aurez plus accès aux prochaines activités et
                  statistiques enregistrés{' '}
                  <b>
                    à partir du moment où vous aurez retiré ‘{displayName}’ de
                    votre équipe.
                  </b>
                  <br />
                  <br />
                  Vous conserverez uniquement l’accès à ses activités et
                  statistiques archivés <b>jusqu’à ce jour.</b>
                </span>
              }
            />
          </RemoveFromTeamModal>,
          document.body,
        )}
      <Button
        title="Retirer ce membre de mon équipe"
        size="small"
        priority="tertiary"
        {...removeFromTeamModalNativeButtonProps}
        {...buttonLoadingClassname(
          removeFromTeamMutation.isPending || removeFromTeamMutation.isSuccess,
          'fr-text-default--error fr-position-relative fr-index-10',
        )}
      >
        <span className="ri-user-unfollow-line" aria-hidden />
      </Button>
    </>
  )
}

export const RetirerDeMonEquipe = withTrpc(RetirerDeMonEquipeComponent)

'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const InvitationComponent = ({
  email,
  coordinateurId,
  sentAt,
}: {
  email: string
  coordinateurId: string
  sentAt: Date
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  const {
    Component: InvitationModal,
    close: closeInvitationModal,
    buttonProps: invitationModalNativeButtonProps,
  } = createModal({
    id: `invitation-modal-${email}`,
    isOpenedByDefault: false,
  })

  const router = useRouter()
  const cancelInvitationMutation = trpc.mediateur.cancelInvitation.useMutation()
  const resendInvitationMutation = trpc.mediateur.resendInvitation.useMutation()

  const onCancelInvitation = async () => {
    try {
      await cancelInvitationMutation.mutateAsync({ email, coordinateurId })
      closeInvitationModal()
      router.refresh()
      createToast({
        priority: 'success',
        message: `L'invitation pour ${email} a bien été supprimée`,
      })
    } catch {
      closeInvitationModal()
      createToast({
        priority: 'error',
        message: `Une erreur est survenue lors de la suppression de l'invitation, veuillez réessayer ultérieurement.`,
      })
    }
  }

  const onResendInvitation = async () => {
    try {
      await resendInvitationMutation.mutateAsync({ email, coordinateurId })
      closeInvitationModal()
      router.refresh()
      createToast({
        priority: 'success',
        message: `L'invitation pour ${email} a bien été renvoyée`,
      })
    } catch {
      closeInvitationModal()
      createToast({
        priority: 'error',
        message: `Une erreur est survenue lors de l'envoi de l'invitation, veuillez réessayer ultérieurement.`,
      })
    }
  }

  const isPending =
    cancelInvitationMutation.isPending || resendInvitationMutation.isPending

  return (
    <>
      {isMounted &&
        createPortal(
          <InvitationModal
            title={`Invitation envoyée le ${dateAsDay(sentAt)}`}
            buttons={[
              {
                children: "Supprimer l'invitation",
                priority: 'primary',
                onClick: onCancelInvitation,
                ...buttonLoadingClassname(
                  cancelInvitationMutation.isPending,
                  'fr-btn--danger',
                ),
              },
              {
                children: "Relancer l'invitation",
                onClick: onResendInvitation,
                iconId: 'fr-icon-mail-line',
                iconPosition: 'right',
                ...buttonLoadingClassname(resendInvitationMutation.isPending),
              },
            ]}
          >
            <p className="fr-text-mention--grey fr-mb-0">
              Adresse électronique
            </p>
            <p className="fr-text--bold fr-mb-0">{email}</p>
          </InvitationModal>,
          document.body,
        )}
      <Button
        title="Gérer l'invitation"
        size="small"
        priority="tertiary"
        {...invitationModalNativeButtonProps}
        {...buttonLoadingClassname(
          isPending,
          'fr-position-relative fr-index-10',
        )}
      >
        <span className="ri-mail-settings-line" aria-hidden />
      </Button>
    </>
  )
}

export const Invitation = withTrpc(InvitationComponent)

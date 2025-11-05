'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'

const RenvoyerInvitationButton = ({
  email,
  coordinateurId,
}: {
  email: string
  coordinateurId: string
}) => {
  const mutation = trpc.mediateur.resendInvitation.useMutation()
  const router = useRouter()

  const onClick = async () => {
    try {
      await mutation.mutateAsync({ email, coordinateurId })
      router.refresh()

      createToast({
        priority: 'success',
        message: `L'invitation a été renvoyée à ${email}`,
      })
    } catch {
      createToast({
        priority: 'error',
        message:
          "Erreur lors de l'envoi de l'invitation, veuillez réessayer ultérieurement.",
      })
    }
  }

  return (
    <Button
      type="button"
      iconId="fr-icon-mail-line"
      size="small"
      priority="tertiary"
      onClick={onClick}
      {...buttonLoadingClassname(mutation.isPending)}
    >
      Renvoyer l'invitation
    </Button>
  )
}

export default withTrpc(RenvoyerInvitationButton)

'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'

const LogoutUserButton = ({ userId }: { userId: string }) => {
  const logoutUserMutation = trpc.user.logoutUser.useMutation()
  const router = useRouter()

  const onLogoutUser = async () => {
    try {
      const result = await logoutUserMutation.mutateAsync({ userId })

      createToast({
        priority: 'success',
        message:
          result.deletedSessionsCount > 0
            ? `L’utilisateur a bien été déconnecté.`
            : 'L’utilisateur n’avait aucune session active.',
      })
      router.refresh()
    } catch {
      createToast({
        priority: 'error',
        message:
          'Erreur lors de la déconnexion de l’utilisateur, veuillez réessayer ou contacter le support.',
      })
    }
  }

  return (
    <Button
      type="button"
      iconId="fr-icon-logout-box-r-line"
      priority="tertiary"
      size="small"
      onClick={onLogoutUser}
      {...buttonLoadingClassname(logoutUserMutation.isPending)}
    >
      Déconnecter
    </Button>
  )
}

export default withTrpc(LogoutUserButton)

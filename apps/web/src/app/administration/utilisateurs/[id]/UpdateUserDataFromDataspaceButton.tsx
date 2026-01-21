'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import { Button } from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'

const UpdateUserDataFromDataspaceButton = ({ userId }: { userId: string }) => {
  const updateMutation = trpc.user.updateFromDataspace.useMutation()
  const router = useRouter()

  const onUpdate = async () => {
    const updatePromise = updateMutation.mutateAsync({ userId })

    router.refresh()

    const updateResult = await updatePromise

    if (updateResult.error) {
      createToast({
        priority: 'error',
        message: `Une erreur est survenue lors de la synchronisation : ${updateResult.error}`,
      })
    } else if (updateResult.noOp) {
      createToast({
        priority: 'info',
        message: `Aucune modification nécessaire.`,
      })
    } else if (updateResult.success) {
      createToast({
        priority: 'success',
        message: `Les informations ont été synchronisées avec succès.`,
      })
    }
    router.refresh()
  }

  const isLoading = updateMutation.isPending

  return (
    <Button
      type="button"
      priority="primary"
      iconId="fr-icon-refresh-line"
      onClick={onUpdate}
      {...buttonLoadingClassname(isLoading)}
    >
      Mettre à jour l’utilisateur depuis le dataspace
    </Button>
  )
}

export default withTrpc(UpdateUserDataFromDataspaceButton)

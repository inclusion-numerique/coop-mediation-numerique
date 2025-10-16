'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import type { UserId, UserRdvAccount } from '@app/web/utils/user'
import { Button } from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'

const AdministrationSyncUserDataButton = ({
  user: { id },
}: {
  user: UserId
}) => {
  const syncMutation = trpc.rdvServicePublic.syncRdvAccountData.useMutation()
  const router = useRouter()

  const onSync = async () => {
    const syncPromise = syncMutation.mutateAsync({ userId: id })

    router.refresh()

    const syncResult = await syncPromise

    if (syncResult.rdvAccount?.error) {
      createToast({
        priority: 'error',
        message: `Une erreur est survenue lors de la synchronisation.`,
      })
    } else {
      createToast({
        priority: 'success',
        message: `Les informations ont été synchronisées avec succès.`,
      })
    }
    router.refresh()
  }

  const isLoading = syncMutation.isPending

  return (
    <Button
      type="button"
      priority="primary"
      iconId="fr-icon-refresh-line"
      onClick={onSync}
      {...buttonLoadingClassname(isLoading)}
    >
      Synchroniser
    </Button>
  )
}

export default withTrpc(AdministrationSyncUserDataButton)

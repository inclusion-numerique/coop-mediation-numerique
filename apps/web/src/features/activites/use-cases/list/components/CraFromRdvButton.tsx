'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import { Button } from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'

const CraFromRdvButton = ({
  rdvId,
  className,
}: {
  rdvId: number
  className?: string
}) => {
  const mutation = trpc.rdvServicePublic.createActiviteFromRdv.useMutation()
  const router = useRouter()

  const onClick = async () => {
    try {
      const { createCraUrl } = await mutation.mutateAsync({ rdvId })
      router.push(createCraUrl)
    } catch {
      createToast({
        priority: 'error',
        message: 'Une erreur est survenue lors de la création du CRA',
      })
      mutation.reset()
    }
  }

  const isLoading = mutation.isPending || mutation.isSuccess

  return (
    <Button
      priority="tertiary no outline"
      size="small"
      title="Compléter un CRA à partir de ce RDV"
      onClick={onClick}
      {...buttonLoadingClassname(isLoading, className)}
    >
      {/* Layout is broken with fr-enlarge-link if icon is in button props, we put it in the title instead */}
      <span className="fr-icon-edit-line fr-icon--sm fr-mr-1-5v" />{' '}
      Compléter&nbsp;un&nbsp;CRA
    </Button>
  )
}

export default withTrpc(CraFromRdvButton)

'use client'

import { createToast } from '@app/ui/toast/createToast'
import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { DeleteBulkBeneficiairesModal } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/(liste)/DeleteBulkBeneficiairesModal'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'

const DeleteBulkBeneficiairesModalContent = ({
  selectedIds,
  onSuccess,
}: {
  selectedIds: string[]
  onSuccess: () => void
}) => {
  const router = useRouter()
  const mutation = trpc.beneficiaires.deleteBulk.useMutation()
  const count = selectedIds.length

  const onDelete = async () => {
    try {
      await mutation.mutateAsync({ ids: selectedIds })
      router.refresh()
      createToast({
        priority: 'success',
        message: `${count} bénéficiaire${sPluriel(count)} supprimé${sPluriel(count)}`,
      })
      DeleteBulkBeneficiairesModal.close()
      onSuccess()
    } catch {
      createToast({
        priority: 'error',
        message:
          'Une erreur est survenue lors de la suppression des bénéficiaires',
      })
      mutation.reset()
    }
  }

  return (
    <DeleteBulkBeneficiairesModal.Component
      title={`Supprimer ${count} bénéficiaire${sPluriel(count)}`}
      buttons={[
        {
          title: 'Annuler',
          priority: 'secondary',
          doClosesModal: true,
          children: 'Annuler',
          type: 'button',
        },
        {
          title: 'Supprimer',
          doClosesModal: false,
          children: 'Supprimer',
          type: 'button',
          onClick: onDelete,
          nativeButtonProps: {
            className: classNames(
              'fr-btn--danger',
              mutation.isPending && 'fr-btn--loading',
            ),
          },
        },
      ]}
    >
      {count === 1 ? (
        <p>
          Le bénéficiaire sélectionné et ses informations personnelles seront
          supprimées.
        </p>
      ) : (
        <p>
          Les {count} bénéficiaires sélectionnés et leurs informations
          personnelles seront supprimées.
        </p>
      )}
      <p>
        <strong>À savoir&nbsp;:</strong> Vos statistiques ne seront pas
        impactées. Les données socio-démographiques de vos bénéficiaires seront
        anonymisées et conservées dans vos statistiques (tranche d’âge, genre,
        statut et commune de résidence).
      </p>
    </DeleteBulkBeneficiairesModal.Component>
  )
}

export default withTrpc(DeleteBulkBeneficiairesModalContent)

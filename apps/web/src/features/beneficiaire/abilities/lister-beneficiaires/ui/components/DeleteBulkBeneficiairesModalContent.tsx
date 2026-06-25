'use client'

import { createToast } from '@app/ui/toast/createToast'
import { supprimerBeneficiairesAction } from '@app/web/app/_actions/beneficiaire/supprimer-beneficiaires.action'
import { pluriel } from '@app/web/libraries/pluriel'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DeleteBulkBeneficiairesModal } from './DeleteBulkBeneficiairesModal'

const DeleteBulkBeneficiairesModalContent = ({
  selectedIds,
  onSuccess,
}: {
  selectedIds: string[]
  onSuccess: () => void
}) => {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const count = selectedIds.length

  const onDelete = async () => {
    setPending(true)
    const result = await supprimerBeneficiairesAction({ ids: selectedIds })
    setPending(false)

    if (!result.success) {
      createToast({
        priority: 'error',
        message:
          'Une erreur est survenue lors de la suppression des bénéficiaires',
      })
      return
    }

    router.refresh()
    createToast({
      priority: 'success',
      message: `${count} ${pluriel(count, 'bénéficiaire supprimé', 'bénéficiaires supprimés')}`,
    })
    DeleteBulkBeneficiairesModal.close()
    onSuccess()
  }

  return (
    <DeleteBulkBeneficiairesModal.Component
      title={`Supprimer ${count} ${pluriel(count, 'bénéficiaire', 'bénéficiaires')}`}
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
              pending && 'fr-btn--loading',
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

export default DeleteBulkBeneficiairesModalContent

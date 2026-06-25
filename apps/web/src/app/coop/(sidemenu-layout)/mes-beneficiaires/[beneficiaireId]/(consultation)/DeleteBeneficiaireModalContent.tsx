'use client'

import { createToast } from '@app/ui/toast/createToast'
import { supprimerBeneficiairesAction } from '@app/web/app/_actions/beneficiaire/supprimer-beneficiaires.action'
import { DeleteBeneficiaireModal } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/DeleteBeneficiaireModal'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const DeleteBeneficiaireModalContent = ({
  beneficiaireId,
  displayName,
  nextPath = '/coop/mes-beneficiaires',
}: {
  displayName: string
  beneficiaireId: string
  nextPath?: string
}) => {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const onDelete = async () => {
    setPending(true)
    const result = await supprimerBeneficiairesAction({ ids: [beneficiaireId] })
    setPending(false)

    if (!result.success) {
      createToast({
        priority: 'error',
        message:
          'Une erreur est survenue lors de la suppression du bénéficiaire',
      })
      return
    }

    router.push(nextPath)
    router.refresh()
    createToast({
      priority: 'success',
      message: (
        <>
          <strong>{displayName}</strong> a bien été supprimé(e)
        </>
      ),
    })
    DeleteBeneficiaireModal.close()
  }
  return (
    <DeleteBeneficiaireModal.Component
      title="Supprimer un bénéficiaire"
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
            'data-testid': 'delete-resource-modal-submit',
          },
        },
      ]}
    >
      <p>
        <strong>{displayName}</strong> sera supprimé(e) de votre liste de
        bénéficiaires et ses informations personnelles ne seront plus
        récupérables.
      </p>
      <p>
        Vos statistiques ne seront pas impactées, et les données anonymes
        (tranche d’âge, genre, etc.) seront conservées.
      </p>
    </DeleteBeneficiaireModal.Component>
  )
}

export default DeleteBeneficiaireModalContent

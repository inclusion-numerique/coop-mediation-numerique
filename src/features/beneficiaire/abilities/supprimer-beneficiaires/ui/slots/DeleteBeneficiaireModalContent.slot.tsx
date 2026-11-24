'use client'

import classNames from 'classnames'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { inject } from '@/libraries/nextjs/injection/client'
import { createToast } from '@/libraries/ui/toast/create-toast'
import { SUPPRIMER_BENEFICIAIRES_ACTION_KEY } from '../../action/supprimer-beneficiaires.key'
import { DeleteBeneficiaireModal } from '../components/DeleteBeneficiaireModal'

const DeleteBeneficiaireModalContent = ({
  beneficiaireId,
  displayName,
  nextPath = '/coop/mes-beneficiaires',
}: {
  displayName: string
  beneficiaireId: string
  nextPath?: Route
}) => {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const onDelete = async () => {
    setPending(true)
    const result = await inject(SUPPRIMER_BENEFICIAIRES_ACTION_KEY)({
      ids: [beneficiaireId],
    })
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

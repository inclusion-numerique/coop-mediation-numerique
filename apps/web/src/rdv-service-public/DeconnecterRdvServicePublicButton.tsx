'use client'

import { createToast } from '@app/ui/toast/createToast'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import React from 'react'

const DeconnecterRdvServicePublicConfirmationModal = createModal({
  id: 'deconnecter-rdv-service-public',
  isOpenedByDefault: false,
})

const DeconnecterRdvServicePublicButton = () => {
  const mutation = trpc.rdvServicePublic.deleteRdvAccount.useMutation()
  const router = useRouter()

  const onDelete = async () => {
    await mutation.mutateAsync()
    createToast({
      priority: 'success',
      message: `Votre compte RDV Service Public a bien été déconnecté.`,
    })
    router.refresh()
  }

  const isLoading = mutation.isPending || mutation.isSuccess

  return (
    <>
      <Button
        type="button"
        priority="secondary"
        className="fr-mb-0"
        iconId="fr-icon-link-unlink"
        {...DeconnecterRdvServicePublicConfirmationModal.buttonProps}
      >
        Déconnecter mon compte
      </Button>
      <DeconnecterRdvServicePublicConfirmationModal.Component
        title="Déconnecter mon compte ?"
        buttons={[
          {
            title: 'Annuler',
            priority: 'secondary',
            doClosesModal: true,
            children: 'Annuler',
            type: 'button',
            disabled: isLoading,
          },
          {
            title: 'Déconnecter',
            doClosesModal: false,
            className: classNames(
              'fr-btn--danger',
              isLoading && 'fr-btn--loading',
            ),
            children: 'Déconnecter',
            type: 'button',
            onClick: onDelete,
          },
        ]}
      >
        <p className="fr-mb-2v">
          En déconnectant votre compte, vous n’aurez plus accès aux
          fonctionnalités de RDV&nbsp;Service&nbsp;Public dans la Coop.
          <br />
          <br />
          Vous pourrez toujours reconnecter votre compte ultérieurement.
        </p>
      </DeconnecterRdvServicePublicConfirmationModal.Component>
    </>
  )
}

export default withTrpc(DeconnecterRdvServicePublicButton)

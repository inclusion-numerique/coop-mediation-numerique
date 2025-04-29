'use client'

import { createToast } from '@app/ui/toast/createToast'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Button from '@codegouvfr/react-dsfr/Button'
import React from 'react'
import classNames from 'classnames'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import { useRouter } from 'next/navigation'

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
          Vous allez déconnecter votre compte Coop de votre compte
          RDV&nbsp;Service&nbsp;Public. Vous n’aurez plus accès aux
          fonctionnalités de RDV&nbsp;Service&nbsp;Public.
          <br />
          <br />
          Vous pourrez toujours reconnecter votre compte
          RDV&nbsp;Service&nbsp;Public à la Coop ultérieurement.
        </p>
      </DeconnecterRdvServicePublicConfirmationModal.Component>
    </>
  )
}

export default withTrpc(DeconnecterRdvServicePublicButton)

'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import React, { ReactNode } from 'react'
import classNames from 'classnames'

const BackButtonWithModal = ({
  modalTitle,
  modalContent,
  modalConfirmButtonLabel = 'Quitter',
  modalCancelButtonLabel = 'Annuler',
  href,
  children = 'Retour',
  className,
}: {
  modalTitle: ReactNode
  modalContent: ReactNode
  modalConfirmButtonLabel?: string
  modalCancelButtonLabel?: string
  href: string
  children?: ReactNode
  className?: string
}) => {
  const {
    Component: LeaveCraModal,
    close: closeLeaveCraModal,
    buttonProps: leaveCraeModalNativeButtonProps,
  } = createModal({
    id: 'leave-cra-modal',
    isOpenedByDefault: false,
  })

  return (
    <>
      <Button
        priority="tertiary no outline"
        size="small"
        className={classNames('fr-mt-4v fr-mb-4v', className)}
        iconId="fr-icon-arrow-left-line"
        {...leaveCraeModalNativeButtonProps}
      >
        {children}
      </Button>
      <LeaveCraModal
        title={modalTitle}
        buttons={[
          {
            children: modalCancelButtonLabel,
            priority: 'secondary',
            onClick: closeLeaveCraModal,
          },
          {
            children: modalConfirmButtonLabel,
            linkProps: { href },
          },
        ]}
      >
        {modalContent}
      </LeaveCraModal>
    </>
  )
}

export default BackButtonWithModal

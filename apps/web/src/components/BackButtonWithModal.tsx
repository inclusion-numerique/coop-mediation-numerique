'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import classNames from 'classnames'
import React, { ReactNode } from 'react'

const BackButtonModalDefinition = createModal({
  id: 'back-button-modal',
  isOpenedByDefault: false,
})

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
}) => (
  <>
    <Button
      priority="tertiary no outline"
      size="small"
      className={classNames('fr-mt-4v fr-mb-4v', className)}
      iconId="fr-icon-arrow-left-line"
      {...BackButtonModalDefinition.buttonProps}
    >
      {children}
    </Button>
    <BackButtonModalDefinition.Component
      title={modalTitle}
      buttons={[
        {
          children: modalCancelButtonLabel,
          priority: 'secondary',
          onClick: BackButtonModalDefinition.close,
        },
        {
          children: modalConfirmButtonLabel,
          linkProps: { href },
        },
      ]}
    >
      {modalContent}
    </BackButtonModalDefinition.Component>
  </>
)

export default BackButtonWithModal

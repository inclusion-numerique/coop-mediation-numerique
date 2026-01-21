'use client'

import Button, { type ButtonProps } from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
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
  href?: string // no href means use router.back()
  children?: ReactNode
  className?: string
}) => {
  const router = useRouter()
  const backButtonProps = href
    ? ({
        linkProps: { href },
        children: modalConfirmButtonLabel,
      } satisfies ButtonProps)
    : ({
        onClick: () => router.back(),
        children: modalConfirmButtonLabel,
      } satisfies ButtonProps)

  return (
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
          backButtonProps,
        ]}
      >
        {modalContent}
      </BackButtonModalDefinition.Component>
    </>
  )
}

export default BackButtonWithModal

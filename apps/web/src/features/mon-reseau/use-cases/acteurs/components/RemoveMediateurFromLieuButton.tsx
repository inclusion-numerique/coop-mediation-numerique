'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { RemoveMediateurFromLieuDynamicModal } from './RemoveMediateurFromLieuModal/RemoveMediateurFromLieuDynamicModal'

const RemoveMediateurFromLieuButton = ({
  className,
  structureId,
  mediateurId,
  mediateurDisplayName,
  structureNom,
  derniereActiviteDate,
  variant,
}: {
  className?: string
  structureId: string
  mediateurId: string
  mediateurDisplayName: string
  structureNom: string
  derniereActiviteDate: Date | null
  variant: 'mediateur' | 'lieu' // if the view of the button is in a mediateur card (remove mediateur wording) or lieu card (remove from my lieux d'activite)
}) => {
  const openModal = RemoveMediateurFromLieuDynamicModal.useOpen()

  const handleClick = () => {
    openModal({
      mediateurId,
      structureId,
      mediateurDisplayName,
      structureNom,
      derniereActiviteDate,
      variant,
    })
  }

  return (
    <Button
      size="small"
      priority={variant === 'mediateur' ? 'secondary' : 'tertiary no outline'}
      className={classNames('fr-display-relative', className)}
      style={{ zIndex: 2 }}
      iconId="fr-icon-close-circle-line"
      iconPosition="right"
      onClick={handleClick}
    >
      {variant === 'mediateur' ? 'Ne travaille plus sur ce lieu' : 'Retirer'}
    </Button>
  )
}

export default RemoveMediateurFromLieuButton

'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import type { LieuId } from '../../../domain/lieu-id'
import type { MediateurId } from '../../../domain/mediateur-id'
import { ModaleDeRetraitDynamique } from './modale-de-retrait'

const BoutonDeRetrait = ({
  className,
  structureId,
  mediateurId,
  mediateurDisplayName,
  structureNom,
  derniereActiviteDate,
  variant,
}: {
  className?: string
  structureId: LieuId
  mediateurId: MediateurId
  mediateurDisplayName: string
  structureNom: string
  derniereActiviteDate: Date | null
  variant: 'mediateur' | 'lieu'
}) => {
  const openModal = ModaleDeRetraitDynamique.useOpen()

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

export default BoutonDeRetrait

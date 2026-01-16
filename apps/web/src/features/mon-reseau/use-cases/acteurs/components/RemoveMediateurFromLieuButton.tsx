'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { RemoveMediateurFromLieuDynamicModal } from './RemoveMediateurFromLieuModal/RemoveMediateurFromLieuDynamicModal'

const RemoveMediateurFromLieuButton = ({
  structureId,
  mediateurId,
  mediateurDisplayName,
  structureNom,
  derniereActiviteDate,
}: {
  structureId: string
  mediateurId: string
  mediateurDisplayName: string
  structureNom: string
  derniereActiviteDate: Date | null
}) => {
  const openModal = RemoveMediateurFromLieuDynamicModal.useOpen()

  const handleClick = () => {
    openModal({
      mediateurId,
      structureId,
      mediateurDisplayName,
      structureNom,
      derniereActiviteDate,
    })
  }

  return (
    <Button
      size="small"
      priority="secondary"
      className="fr-display-relative"
      style={{ zIndex: 2 }}
      iconId="fr-icon-close-circle-line"
      iconPosition="right"
      onClick={handleClick}
    >
      Ne travaille plus sur ce lieu
    </Button>
  )
}

export default RemoveMediateurFromLieuButton

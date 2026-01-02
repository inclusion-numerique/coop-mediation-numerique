'use client'

import Button from '@codegouvfr/react-dsfr/Button'

const RemoveMediateurFromLieuButton = ({
  structureId,
  mediateurId,
}: {
  structureId: string
  mediateurId: string
}) => {
  /// TODO implement this feature with dynamic modal
  return (
    <Button
      size="small"
      priority="secondary"
      className="wip-outline fr-display-relative"
      iconId="fr-icon-close-circle-line"
      iconPosition="right"
    >
      Ne travaille plus sur ce lieu
    </Button>
  )
}

export default RemoveMediateurFromLieuButton

import React from 'react'
import { THEMATIQUE_ANIMATION_OPTIONS } from '../../../../cra/animation/labels'
import { CustomLabel } from '../CustomLabel'

export const ThematiqueAnimationLabel = ({
  thematiqueAnimation,
  thematiqueAnimationAutre,
}: {
  thematiqueAnimation: string
  thematiqueAnimationAutre: string | null
}) => {
  return (
    <CustomLabel
      value={
        THEMATIQUE_ANIMATION_OPTIONS.find(
          ({ value }) => value === thematiqueAnimation,
        )?.label
      }
      customizableValue="Autre"
      customValue={thematiqueAnimationAutre}
    />
  )
}

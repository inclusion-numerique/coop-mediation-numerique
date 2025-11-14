import React from 'react'
import { ORGANISATEURS_OPTIONS } from '../../../../cra/evenement/labels'
import { CustomLabel } from '../CustomLabel'

export const OrganisateursLabel = ({
  organisateur,
  organisateurAutre,
}: {
  organisateur: string
  organisateurAutre: string | null
}) => {
  return (
    <CustomLabel
      value={
        ORGANISATEURS_OPTIONS.find(({ value }) => value === organisateur)?.label
      }
      customizableValue="Autre"
      customValue={organisateurAutre}
    />
  )
}

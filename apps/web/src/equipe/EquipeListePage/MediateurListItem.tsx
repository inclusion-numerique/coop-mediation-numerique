import Badge from '@codegouvfr/react-dsfr/Badge'
import type { AlertProps } from '@codegouvfr/react-dsfr/src/Alert'
import React from 'react'
import { UserRole } from '../UserRole'
import { type MediateurListProps } from './MediateurList'

const statusSeverity = (status: string): AlertProps.Severity | undefined => {
  if (status.startsWith('Actif')) return 'success'
  if (status.startsWith('Inactif')) return 'warning'
  if (status.startsWith('Ancien membre')) return undefined
  return 'info'
}

const showFinDeContratFeatureFlag = false

export const MediateurListItem = ({
  email,
  firstName,
  lastName,
  phone,
  status,
  isConseillerNumerique,
  finDeContrat,
  type,
}: MediateurListProps) =>
  firstName || lastName ? (
    <div className="fr-py-5v fr-px-2v">
      <div className="fr-mb-2v fr-flex fr-flex-gap-2v fr-justify-content-space-between fr-direction-md-row fr-direction-column">
        <div className="fr-flex fr-flex-gap-2v fr-direction-md-row fr-direction-column">
          <span className="fr-text--bold ">
            {[firstName, lastName].filter(Boolean).join(' ')}
          </span>
          {showFinDeContratFeatureFlag && finDeContrat && (
            <Badge severity="warning">Fin de contrat le {finDeContrat}</Badge>
          )}
        </div>
        <div>
          {type === 'invited' ? (
            <Badge severity="info" noIcon>
              Invitation envoyée
            </Badge>
          ) : (
            <Badge
              severity={statusSeverity(status)}
              noIcon
              className={
                statusSeverity(status) === undefined
                  ? 'fr-text-mention--grey'
                  : ''
              }
            >
              {status}
            </Badge>
          )}
        </div>
      </div>
      <div className="fr-text-mention--grey fr-text--semi-bold fr-text--sm fr-mb-0 fr-flex fr-flex-gap-2v fr-direction-md-row fr-direction-column">
        <UserRole isConseillerNumerique={isConseillerNumerique} />
        {email && (
          <>
            <span className="fr-hidden fr-unhidden-md" aria-hidden>
              ·
            </span>
            <span>
              <span className="ri-mail-line fr-mr-2v" aria-hidden />
              {email}
            </span>
          </>
        )}
        {phone && (
          <>
            <span className="fr-hidden fr-unhidden-md" aria-hidden>
              ·
            </span>
            <span>
              <span className="ri-phone-line fr-mr-2v" aria-hidden />
              {phone}
            </span>
          </>
        )}
      </div>
    </div>
  ) : (
    <div className="fr-text--bold fr-py-9v fr-px-2v fr-flex fr-justify-content-space-between fr-direction-md-row fr-direction-column">
      {email}
      {type === 'invited' ? (
        <Badge severity="info" noIcon>
          Invitation envoyée
        </Badge>
      ) : (
        <Badge
          severity={statusSeverity(status)}
          noIcon
          className={
            statusSeverity(status) === undefined ? 'fr-text-mention--grey' : ''
          }
        >
          {status}
        </Badge>
      )}
    </div>
  )

import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import React from 'react'
import MonEquipeHeader from './MonEquipeHeader'

const EquipeCount = ({
  label,
  count,
  icon,
}: {
  label: string
  count: number
  icon: string
}) => (
  <div className="fr-background-alt--brown-caramel fr-border-radius--8 fr-px-6v fr-py-4v fr-flex fr-justify-content-space-between fr-flex-1 fr-flex-gap-3v">
    <div>
      <div className="fr-text--sm fr-mb-0">{label}</div>
      <div className="fr-text--semi-bold fr-mb-0">{count}</div>
    </div>
    {icon.startsWith('/') ? (
      <img
        className="fr-background-default--grey fr-p-3v fr-border-radius--8 fr-line-height-1"
        alt=""
        src={icon}
      />
    ) : (
      <span
        className={classNames(
          icon,
          'ri-lg fr-background-default--grey fr-text-label--blue-france fr-p-3v fr-border-radius--8 fr-line-height-1',
        )}
        aria-hidden
      />
    )}
  </div>
)

export const Equipe = ({
  mediateurs: { conseillersNumeriques, mediateursNumeriques },
}: {
  mediateurs: {
    total: number
    conseillersNumeriques: number
    mediateursNumeriques: number
  }
}) => (
  <>
    <MonEquipeHeader />
    <div className="fr-flex fr-flex-gap-6v fr-direction-lg-row fr-direction-column">
      <EquipeCount
        label="Conseillers numériques"
        count={conseillersNumeriques}
        icon="/images/services/conseillers-numerique-icon.svg"
      />
      <EquipeCount
        label="Médiateurs numériques"
        count={mediateursNumeriques}
        icon="ri-account-circle-line"
      />
    </div>
  </>
)

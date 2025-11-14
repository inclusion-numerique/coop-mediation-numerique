import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import React from 'react'

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
    <div className="fr-flex fr-flex-wrap fr-flex-gap-4v fr-align-items-center fr-justify-content-space-between fr-mb-3w">
      <h2 className="fr-h5 fr-text-mention--grey fr-mb-0">
        <span className="ri-group-2-line fr-mr-1w" aria-hidden />
        Mon équipe
      </h2>
      <Button
        priority="tertiary no outline"
        size="small"
        linkProps={{
          href: '/coop/mon-equipe',
        }}
        iconId="fr-icon-arrow-right-line"
        iconPosition="right"
      >
        Voir mon équipe
      </Button>
    </div>
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

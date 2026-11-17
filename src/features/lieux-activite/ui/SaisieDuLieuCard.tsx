import { libelleDeTypologie } from '@app/web/features/lieux-activite/ui/libelles-typologie'
import { addresseFromParts } from '@app/web/utils/addresseFromParts'
import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import type { ReactNode } from 'react'

export type LieuSaisi = {
  readonly nom: string
  readonly adresse?: string | null
  readonly commune?: string | null
  readonly codePostal?: string | null
  readonly siret?: string | null
  readonly typologies?: readonly string[] | null
}

const libelles = (typologies: readonly string[]): string =>
  typologies.map(libelleDeTypologie).join(', ')

export const SaisieDuLieuCard = ({
  lieu: { nom, adresse, siret, codePostal, commune, typologies },
  topRight,
  infoLinkHref,
  className,
}: {
  className?: string
  lieu: LieuSaisi
  topRight?: ReactNode
  infoLinkHref?: string
}) => {
  const tooltipId = `tooltip-${nom.replaceAll('"', '')}-${typologies?.join(',')}-${siret}-${codePostal}-${commune}-${adresse}`

  const adresseAffichee = addresseFromParts({ adresse, codePostal, commune })

  return (
    <div
      className={classNames(
        'fr-width-full fr-border-radius--8 fr-border fr-p-6v fr-p-md-8v fr-card--structure',
        className,
      )}
    >
      <div className="fr-width-full fr-flex fr-justify-content-space-between fr-align-items-start">
        <p className="fr-h6 fr-mb-0">{nom}</p>
        {!!topRight && <div>{topRight}</div>}
      </div>
      {!!adresseAffichee && (
        <p className="fr-text--sm fr-mt-1v fr-text-mention--grey fr-mb-0">
          <span className="fr-icon-map-pin-2-line fr-icon--sm fr-mr-1w" />
          {adresseAffichee}
        </p>
      )}

      {!!typologies && typologies.length > 0 && (
        <p className="fr-mt-1v fr-text--sm fr-text-mention--grey fr-mb-0 fr-flex fr-align-items-center">
          <span className="fr-icon-government-line fr-icon--sm fr-mr-1w" />
          {typologies.join(', ')}
          <button
            type="button"
            className="fr-btn--tooltip fr-btn"
            aria-describedby={tooltipId}
          >
            Information typologies
          </button>
          <span
            className="fr-tooltip fr-placement"
            id={tooltipId}
            role="tooltip"
            aria-hidden
          >
            {libelles(typologies)}
          </span>
        </p>
      )}

      {siret && (
        <p className="fr-mt-1v fr-text--sm fr-text-mention--grey fr-mb-0">
          <span className="fr-text--medium">SIRET</span>&nbsp;: {siret}
        </p>
      )}
      {!!infoLinkHref && (
        <Button
          className="fr-mt-4v"
          priority="tertiary no outline"
          linkProps={{ href: infoLinkHref }}
          iconPosition="right"
          iconId="fr-icon-eye-line"
          size="small"
        >
          Voir plus d’infos
        </Button>
      )}
    </div>
  )
}

export default SaisieDuLieuCard

import * as vocabulaire from '@app/web/features/lieux-activite/vocabulaire'
import { addresseFromParts } from '@app/web/utils/addresseFromParts'
import Button from '@codegouvfr/react-dsfr/Button'
import type { Typologie } from '@prisma/client'
import classNames from 'classnames'
import type { ReactNode } from 'react'

/**
 * Ce que la carte montre d'un lieu d'activité : comment il s'appelle, où il
 * est, ce qu'il accueille, sous quel numéro il est immatriculé.
 *
 * Tout y est facultatif sauf le nom. Un lieu saisi à la main n'a ni SIRET ni
 * RNA — c'est même la raison d'être de la saisie : décrire un endroit que les
 * annuaires ignorent.
 */
export type LieuActiviteAffiche = {
  readonly nom: string
  readonly adresse?: string | null
  readonly commune?: string | null
  readonly codePostal?: string | null
  readonly siret?: string | null
  readonly rna?: string | null
  readonly typologies?: readonly string[] | null
}

/**
 * Les typologies voyagent sous les noms d'enum de la coop ; l'infobulle les rend
 * lisibles. Ce qu'on ne reconnaît pas s'affiche tel quel plutôt que de
 * disparaître : une typologie inconnue vaut mieux qu'un trou.
 */
const libelles = (typologies: readonly string[]): string =>
  (typologies as Typologie[])
    .map((typologie) =>
      typologie in vocabulaire.typologieLibelles
        ? vocabulaire.typologieLibelles[typologie].toString()
        : typologie.toString(),
    )
    .join(', ')

export const LieuActiviteCard = ({
  lieu: { nom, adresse, rna, siret, codePostal, commune, typologies },
  topRight,
  infoLinkHref,
  className,
}: {
  className?: string
  lieu: LieuActiviteAffiche
  topRight?: ReactNode
  infoLinkHref?: string
}) => {
  const tooltipId = `tooltip-${nom.replaceAll('"', '')}-${typologies?.join(',')}-${siret}-${rna}-${codePostal}-${commune}-${adresse}`

  // Un lieu peut n'avoir aucune adresse exploitable (établissement non
  // diffusible) : on masque alors la ligne entière plutôt que d'afficher une
  // épingle sans rien à côté.
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

      {(siret || rna) && (
        <p className="fr-mt-1v fr-text--sm fr-text-mention--grey fr-mb-0">
          {siret ? (
            <>
              <span className="fr-text--medium">SIRET</span>&nbsp;: {siret}
            </>
          ) : null}
          {rna ? (
            <>
              <span className="fr-text--medium">RNA</span>&nbsp;: {rna}
            </>
          ) : null}
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

export default LieuActiviteCard

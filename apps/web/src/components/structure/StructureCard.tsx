import * as vocabulaire from '@app/web/features/lieux-activite/vocabulaire'
import { addresseFromParts } from '@app/web/utils/addresseFromParts'
import Button from '@codegouvfr/react-dsfr/Button'
import type { Typologie } from '@prisma/client'
import classNames from 'classnames'
import type { ReactNode } from 'react'

/**
 * Ce que la carte montre d'un établissement : comment il s'appelle, où il est,
 * ce qu'il est, sous quel numéro il est immatriculé. Tout est facultatif sauf
 * le nom — une structure de l'annuaire des entreprises peut n'être diffusée
 * qu'à moitié, et un lieu saisi à la main n'a pas d'immatriculation.
 */
export type StructureCardStructure = {
  readonly nom: string
  readonly adresse?: string | null
  readonly commune?: string | null
  readonly codePostal?: string | null
  readonly siret?: string | null
  readonly rna?: string | null
  readonly typologies?: readonly string[] | null
}

const StructureCard = ({
  structure: { nom, adresse, rna, siret, codePostal, commune, typologies },
  topRight,
  infoLinkHref,
  className,
}: {
  className?: string
  structure: StructureCardStructure
  topRight?: ReactNode
  infoLinkHref?: string
}) => {
  const tooltipId = `tooltip-${nom.replaceAll('"', '')}-${typologies?.join(',')}-${siret}-${rna}-${codePostal}-${commune}-${adresse}`

  // Une structure peut n'avoir aucune adresse exploitable (établissement non
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

      {!!typologies && typologies?.length > 0 && (
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
            {(typologies as Typologie[])
              .map((typologie) =>
                typologie in vocabulaire.typologieLibelles
                  ? vocabulaire.typologieLibelles[typologie].toString()
                  : typologie.toString(),
              )
              .join(', ')}
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

export default StructureCard

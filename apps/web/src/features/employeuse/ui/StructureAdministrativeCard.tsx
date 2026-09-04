import { addresseFromParts } from '@app/web/utils/addresseFromParts'
import classNames from 'classnames'
import type { ReactNode } from 'react'

/**
 * Ce que la carte montre d'une structure administrative : comment elle
 * s'appelle, où elle est, sous quel numéro elle est immatriculée.
 *
 * Pas de typologie : une employeuse est une personne morale, décrite par son
 * immatriculation et sa forme juridique — ce qu'un lieu accueille du public ne
 * la concerne pas. C'est ce qui distingue cette carte de celle du lieu, qu'elle
 * ne fait que ressembler.
 *
 * Le nom peut manquer : quatorze employeuses de production n'en portent pas,
 * et l'annuaire des entreprises masque celui des établissements non diffusibles.
 */
export type StructureAdministrativeAffichee = {
  readonly nom: string | null
  readonly adresse?: string | null
  readonly commune?: string | null
  readonly codePostal?: string | null
  readonly siret?: string | null
  readonly rna?: string | null
}

export const StructureAdministrativeCard = ({
  structure: { nom, adresse, rna, siret, codePostal, commune },
  topRight,
  className,
}: {
  className?: string
  structure: StructureAdministrativeAffichee
  topRight?: ReactNode
}) => {
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
        <p className="fr-h6 fr-mb-0">{nom ?? 'Structure sans dénomination'}</p>
        {!!topRight && <div>{topRight}</div>}
      </div>
      {!!adresseAffichee && (
        <p className="fr-text--sm fr-mt-1v fr-text-mention--grey fr-mb-0">
          <span className="fr-icon-map-pin-2-line fr-icon--sm fr-mr-1w" />
          {adresseAffichee}
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
    </div>
  )
}

export default StructureAdministrativeCard

import { getCartographieNationaleSourceLabel } from '@app/web/libraries/cartographie-nationale'
import { pluriel } from '@app/web/libraries/pluriel'
import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import classNames from 'classnames'
import { format, isAfter, isBefore, subDays, subYears } from 'date-fns'
import Link from 'next/link'
import type { ReactNode } from 'react'
import CartographyIndicator, {
  getCartographyStatus,
} from './CartographyIndicator'

/**
 * Ce que la carte montre d'un lieu où l'on exerce : qui y exerce, s'il est
 * publié sur la cartographie nationale, et depuis quand sa fiche n'a pas bougé.
 *
 * À distinguer de `LieuSaisi`, qui décrit un endroit qu'on est en train de
 * retenir. Ici le lieu est un dossier chez nous, avec une histoire.
 */
export type LieuEnActivite = {
  readonly id: string
  readonly nom: string
  readonly nomUsage: string | null
  readonly adresse: string
  readonly complementAdresse: string | null
  readonly commune: string
  readonly codePostal: string
  readonly modification: Date
  readonly derniereModificationSource: string | null
  readonly visiblePourCartographieNationale: boolean
  readonly structureCartographieNationaleId: string | null
  readonly _count: { readonly mediateursEnActivite: number }
}

const LieuActiviteCard = ({
  lieu,
  href,
  derniereModificationPar,
  className,
  retrait,
  showActionButtons = false,
}: {
  lieu: LieuEnActivite
  /**
   * Où mène la carte. Le lien est fourni plutôt que calculé : les fiches de
   * lieu vivent sous l'annuaire, et cette feature n'a pas à connaître son plan
   * de routes.
   */
  href: string
  /** Le nom de la personne, déjà mis en forme par l'appelant. */
  derniereModificationPar?: string | null
  className?: string
  // Le bouton qui retire ce lieu de la liste, quand la page en propose un.
  retrait?: ReactNode
  // Boutons Modifier/Retirer explicites, au lieu d'une carte cliquable en entier.
  showActionButtons?: boolean
}) => {
  const mediateursCount = lieu._count.mediateursEnActivite ?? 0

  // Le nom d'usage est celui sous lequel l'établissement est connu de SIRENE ;
  // quand il existe, il prime sur celui que la fiche se donne.
  const nomAffiche = lieu.nomUsage || lieu.nom

  const cartographyStatus = getCartographyStatus({
    visiblePourCartographieNationale: lieu.visiblePourCartographieNationale,
    structureCartographieNationaleId: lieu.structureCartographieNationaleId,
    hasRecentModification: isAfter(
      new Date(lieu.modification),
      subDays(new Date(), 1),
    ),
  })

  // À défaut d'une personne, la source de l'import : une fiche modifiée par un
  // moissonnage n'a pas d'auteur, mais elle a une provenance.
  const auteur =
    derniereModificationPar ??
    (lieu.derniereModificationSource
      ? getCartographieNationaleSourceLabel(lieu.derniereModificationSource)
      : null)

  const parQui = auteur ? `par ${auteur}` : ''

  const tropAncien = isBefore(
    new Date(lieu.modification),
    subYears(new Date(), 1),
  )

  return (
    <article
      id={lieu.id}
      className={classNames(
        'fr-border-bottom fr-pt-4v fr-px-2v fr-pb-6v fr-lieu-activite-card',
        { 'fr-enlarge-link': !showActionButtons },
        { 'fr-lieu-activite-card--sans-survol': showActionButtons },
        className,
      )}
    >
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-mb-2v">
        {tropAncien ? (
          <div className="fr-flex fr-align-items-center fr-flex-gap-2v">
            <div
              className="fr-background-contrast--warning fr-border-radius--4 fr-flex fr-align-items-center fr-justify-content-center"
              style={{ height: 20, width: 20 }}
            >
              <span
                className="fr-text-default--warning fr-icon-error-warning-fill fr-icon--xs"
                aria-hidden
              />
            </div>

            <p className="fr-text--xs fr-mb-0 fr-text-default--warning">
              Dernière mise à jour il y a plus d’un an {parQui}
            </p>
          </div>
        ) : (
          <p className="fr-text--xs fr-mb-0 fr-text-mention--grey">
            Mis à jour le {format(new Date(lieu.modification), 'dd.MM.yyyy')}{' '}
            {parQui}
          </p>
        )}
        {showActionButtons ? (
          <span className="fr-flex fr-flex-gap-2v">
            <Button
              size="small"
              priority="tertiary no outline"
              linkProps={{ href }}
              iconPosition="right"
              iconId="fr-icon-pencil-line"
            >
              Modifier
            </Button>
            {retrait}
          </span>
        ) : (
          retrait && (
            <span className="fr-lieu-activite-card__au-dessus">{retrait}</span>
          )
        )}
      </div>

      <p className="fr-text--bold fr-text--lg fr-mb-2v fr-text-title--blue-france">
        {nomAffiche}
      </p>

      <p className="fr-text--sm fr-mb-4v fr-text-mention--grey fr-flex fr-align-items-center">
        <span className="ri-map-pin-2-line fr-mr-1w" aria-hidden />
        {lieu.adresse}
        {lieu.complementAdresse && ` (${lieu.complementAdresse})`},{' '}
        {lieu.codePostal} {lieu.commune}
      </p>

      <div className="fr-flex fr-flex-wrap fr-flex-gap-2v fr-align-items-center">
        <CartographyIndicator
          status={cartographyStatus}
          structureCartographieNationaleId={
            lieu.structureCartographieNationaleId
          }
          structureId={lieu.id}
          className="fr-lieu-activite-card__au-dessus"
        />
        <Tag small className="fr-lieu-activite-card__au-dessus">
          <span className="ri-account-circle-fill fr-mr-1v" aria-hidden />
          {mediateursCount}{' '}
          {pluriel(
            mediateursCount,
            'médiateur numérique référencé',
            'médiateurs numériques référencés',
          )}
        </Tag>
      </div>
      {!showActionButtons && <Link href={href} prefetch={false} />}
    </article>
  )
}

export default LieuActiviteCard

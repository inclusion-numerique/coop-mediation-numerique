import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import classNames from 'classnames'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { LieuEnListe } from '../domain/lieu-en-liste'
import CartographyIndicator from './CartographyIndicator'
import { carteDuLieu } from './lieu-activite-card.presenter'

const LieuActiviteCard = ({
  lieu,
  href,
  className,
  retrait,
  showActionButtons = false,
}: {
  lieu: LieuEnListe
  href: string
  className?: string
  retrait?: ReactNode
  showActionButtons?: boolean
}) => {
  const carte = carteDuLieu(lieu, new Date())

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
        {carte.miseAJour._tag === 'TropAncienne' ? (
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
              {carte.miseAJour.texte}
            </p>
          </div>
        ) : (
          <p className="fr-text--xs fr-mb-0 fr-text-mention--grey">
            {carte.miseAJour.texte}
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
        {carte.nom}
      </p>

      <p className="fr-text--sm fr-mb-4v fr-text-mention--grey fr-flex fr-align-items-center">
        <span className="ri-map-pin-2-line fr-mr-1w" aria-hidden />
        {carte.adresse}
      </p>

      <div className="fr-flex fr-flex-wrap fr-flex-gap-2v fr-align-items-center">
        {lieu.adresseAPreciser && (
          <Badge small severity="warning">
            Adresse à préciser
          </Badge>
        )}
        <CartographyIndicator
          status={carte.statutCartographie}
          structureCartographieNationaleId={lieu.identifiantCartographie}
          structureId={lieu.id}
          className="fr-lieu-activite-card__au-dessus"
        />
        <Tag small className="fr-lieu-activite-card__au-dessus">
          <span className="ri-account-circle-fill fr-mr-1v" aria-hidden />
          {carte.mediateurs}
        </Tag>
      </div>
      {!showActionButtons && <Link href={href} prefetch={false} />}
    </article>
  )
}

export default LieuActiviteCard

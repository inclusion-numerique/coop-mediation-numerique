import classNames from 'classnames'
import Link from 'next/link'
import { Fragment } from 'react'
import type { Acteur } from '../domain'
import { hrefDeLActeur } from './liens'
import { iconeDuProfil, libelleDuProfil } from './profil.presenter'

export const ProfilEtContact = ({
  acteur: { courriel, profil },
  compact = false,
  className,
  classeDesLiens,
}: {
  acteur: Acteur
  compact?: boolean
  className?: string
  classeDesLiens?: string
}) => {
  const icone = iconeDuProfil(profil)
  const libelle = libelleDuProfil(profil)
  const coordinateurs = profil.mediation?.coordinateurs ?? []

  return (
    <div className={className}>
      <p
        className={classNames(
          'fr-text--sm fr-flex fr-align-items-center',
          compact ? 'fr-mb-2v' : 'fr-mb-3v',
        )}
      >
        {icone !== null && (
          <img
            src={icone}
            alt={libelle}
            className="fr-mr-1w"
            width={18}
            height={18}
          />
        )}
        {libelle}
        {coordinateurs.length > 0 && (
          <>
            &nbsp;coordonné par&nbsp;
            {coordinateurs.map((coordinateur, rang) => (
              <Fragment key={coordinateur.acteurId}>
                <Link
                  className={classNames(
                    'fr-link fr-link--sm fr-position-relative',
                    classeDesLiens,
                  )}
                  href={hrefDeLActeur(
                    coordinateur.departement,
                    coordinateur.acteurId,
                  )}
                  prefetch={false}
                >
                  {coordinateur.nomAffiche}
                </Link>
                {rang < coordinateurs.length - 1 && ', '}
              </Fragment>
            ))}
          </>
        )}
      </p>
      <p className="fr-flex fr-align-items-center fr-text--sm fr-text-mention--grey fr-mb-0">
        <span className="ri-mail-line fr-mr-1v" aria-hidden />
        {courriel}
      </p>
    </div>
  )
}

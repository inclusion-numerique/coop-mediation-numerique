import Tag from '@codegouvfr/react-dsfr/Tag'
import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'
import type { MediateurDuLieu } from '../domain'
import {
  hrefDeLActeur,
  iconeDuProfil,
  libelleDesLieux,
  libelleDuProfil,
} from './mediateur-du-lieu.presenter'

export const CarteDuMediateur = ({
  mediateur: {
    acteurId,
    nomAffiche,
    courriel,
    profil,
    nombreDeLieux,
    coordinateurs,
  },
  departement,
  retrait,
}: {
  mediateur: MediateurDuLieu
  departement: string
  retrait?: ReactNode
}) => {
  const icone = iconeDuProfil(profil)
  const libelle = libelleDuProfil(profil)

  return (
    <article
      id={acteurId}
      className="fr-acteur-card fr-enlarge-link fr-border-bottom fr-pt-4v fr-px-2v fr-pb-6v"
    >
      <div className="fr-flex fr-flex-gap-2v fr-mb-2v fr-align-items-center fr-justify-content-space-between">
        <p className="fr-text--bold fr-text--lg fr-mb-0 fr-text-title--blue-france">
          {nomAffiche}
        </p>
        {retrait}
      </div>
      <p className="fr-text--sm fr-flex fr-align-items-center fr-mb-2v">
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
                  className="fr-link fr-link--sm fr-acteur-card__au-dessus"
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
      <p
        className={`fr-flex fr-align-items-center fr-text--sm fr-text-mention--grey ${nombreDeLieux > 0 ? 'fr-mb-4v' : 'fr-mb-0'}`}
      >
        <span className="ri-mail-line fr-mr-1v" aria-hidden />
        {courriel}
      </p>
      {nombreDeLieux > 0 && (
        <Tag small className="fr-tag fr-tag--sm fr-acteur-card__au-dessus">
          <span className="ri-home-office-fill fr-mr-1v" aria-hidden />
          {libelleDesLieux(nombreDeLieux)}
        </Tag>
      )}
      <Link
        href={hrefDeLActeur(departement, acteurId, acteurId)}
        prefetch={false}
      />
    </article>
  )
}

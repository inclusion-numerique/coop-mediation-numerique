import Tag from '@codegouvfr/react-dsfr/Tag'
import Link from 'next/link'
import type { Acteur } from '../domain'
import { hrefDeLActeur } from './liens'
import { ProfilEtContact } from './ProfilEtContact'
import { libelleDesLieux } from './profil.presenter'

export const CarteDActeur = ({
  acteur,
  departement,
}: {
  acteur: Acteur
  departement: string
}) => {
  const nombreDeLieux = acteur.profil.mediation?.nombreDeLieux ?? 0

  return (
    <article
      id={acteur.acteurId}
      className="fr-acteur-card fr-enlarge-link fr-border-bottom fr-pt-4v fr-px-2v fr-pb-6v"
    >
      <p className="fr-text--bold fr-text--lg fr-mb-2v fr-text-title--blue-france">
        {acteur.nomAffiche}
      </p>
      <ProfilEtContact
        acteur={acteur}
        compact
        className={nombreDeLieux > 0 ? 'fr-mb-4v' : undefined}
        classeDesLiens="fr-acteur-card__au-dessus"
      />
      {nombreDeLieux > 0 && (
        <Tag small className="fr-tag fr-tag--sm fr-acteur-card__au-dessus">
          <span className="ri-home-office-fill fr-mr-1v" aria-hidden />
          {libelleDesLieux(nombreDeLieux)}
        </Tag>
      )}
      <Link
        href={hrefDeLActeur(departement, acteur.acteurId, acteur.acteurId)}
        prefetch={false}
      />
    </article>
  )
}

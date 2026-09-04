import { personneEstConseillerNumerique } from '@app/web/features/employeuse'
import ActeurProfilAndContact from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurProfilAndContact'
import type { ActeurForList } from '@app/web/features/mon-reseau/use-cases/acteurs/db/searchActeurs'
import { getActeurDisplayName } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDisplayName'
import { getActeurPageUrl } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurPageUrl'
import Tag from '@codegouvfr/react-dsfr/Tag'
import classNames from 'classnames'
import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './ActeurCard.module.css'

const ActeurCard = ({
  acteur,
  departementCode,
  retrait,
}: {
  acteur: ActeurForList
  departementCode: string
  // Le bouton qui retire ce médiateur du lieu, quand la page en propose un. Il
  // appartient aux lieux d'activité ; la carte se contente de lui faire place.
  retrait?: ReactNode
}) => {
  const displayName = getActeurDisplayName(acteur)
  const lieuxActiviteCount = acteur.mediateur?._count.enActivite ?? 0

  const acteurPageUrl = getActeurPageUrl({
    departementCode,
    userId: acteur.id,
    anchor: acteur.id,
  })

  return (
    <article
      id={acteur.id}
      className={classNames(
        'fr-enlarge-link fr-border-bottom fr-pt-4v fr-px-2v fr-pb-6v',
        styles.card,
      )}
    >
      <div className="fr-flex fr-flex-gap-2v fr-mb-2v fr-align-items-center fr-justify-content-space-between">
        <p className="fr-text--bold fr-text--lg fr-mb-0 fr-text-title--blue-france">
          {displayName}
        </p>
        {retrait}
      </div>

      <ActeurProfilAndContact
        // Le dispositif est dérivé ICI, côté serveur : le composant client reçoit un booléen tout
        // fait plutôt que la liste des affectations.
        acteur={{
          ...acteur,
          isConseillerNumerique: personneEstConseillerNumerique(
            acteur.personneMain,
          ),
        }}
        departementCode={departementCode}
        compact
        className={lieuxActiviteCount > 0 ? 'fr-mb-4v' : undefined}
        classes={{
          link: styles.innerLink,
        }}
      />

      {lieuxActiviteCount > 0 && (
        <Tag
          small
          className={classNames('fr-tag fr-tag--sm', styles.innerLink)}
        >
          <span className="ri-home-office-fill fr-mr-1v" aria-hidden />
          {lieuxActiviteCount} {lieuxActiviteCount === 1 ? 'lieu' : 'lieux'}{' '}
          d’activité
        </Tag>
      )}
      <Link href={acteurPageUrl} prefetch={false} />
    </article>
  )
}

export default ActeurCard

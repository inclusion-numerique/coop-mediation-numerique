import ActeurProfilAndContact from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurProfilAndContact'
import type { ActeurForList } from '@app/web/features/mon-reseau/use-cases/acteurs/db/searchActeurs'
import { getActeurDisplayName } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDisplayName'
import { getActeurPageUrl } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurPageUrl'
import classNames from 'classnames'
import Link from 'next/link'
import styles from './ActeurCard.module.css'

const ActeurCard = ({
  acteur,
  currentPath,
}: {
  acteur: ActeurForList
  currentPath: string
}) => {
  const displayName = getActeurDisplayName(acteur)
  const lieuxActiviteCount = acteur.mediateur?._count.enActivite ?? 0

  const retour = currentPath

  const acteurPageUrl = getActeurPageUrl({
    userId: acteur.id,
    retour,
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
      <p className="fr-text--bold fr-text--lg fr-mb-2v fr-text-title--blue-france">
        <Link href={acteurPageUrl} prefetch={false}>
          {displayName}
        </Link>
      </p>

      <ActeurProfilAndContact acteur={acteur} retour={retour} compact />

      {lieuxActiviteCount > 0 && (
        <Link
          href={getActeurPageUrl({
            userId: acteur.id,
            retour,
            anchor: 'lieux-activite',
          })}
          prefetch={false}
          className={classNames('fr-tag fr-tag--sm', styles.innerLink)}
        >
          <span className="ri-home-office-fill fr-mr-1v" aria-hidden />
          {lieuxActiviteCount} {lieuxActiviteCount === 1 ? 'lieu' : 'lieux'}{' '}
          d’activité
        </Link>
      )}
    </article>
  )
}

export default ActeurCard

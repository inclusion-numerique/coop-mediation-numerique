import ActeurProfilAndContact from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurProfilAndContact'
import type { ActeurForList } from '@app/web/features/mon-reseau/use-cases/acteurs/db/searchActeurs'
import { getActeurDisplayName } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDisplayName'
import { getActeurPageUrl } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurPageUrl'
import classNames from 'classnames'
import Link from 'next/link'
import styles from './ActeurCard.module.css'
import RemoveMediateurFromLieuButton from './RemoveMediateurFromLieuButton'

const ActeurCard = ({
  acteur,
  currentPath,
  canRemoveMediateurFromLieuId,
}: {
  acteur: ActeurForList
  currentPath: string
  canRemoveMediateurFromLieuId?: string // id of a lieux d'activité from which a mediateur can be removed. if undefined, the mediateur cannot be removed from the lieu
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
      <div className="fr-flex fr-flex-gap-2v fr-mb-2v fr-align-items-center fr-justify-content-space-between">
        <p className="fr-text--bold fr-text--lg fr-mb-0 fr-text-title--blue-france">
          {displayName}
        </p>
        {canRemoveMediateurFromLieuId && acteur.mediateur && (
          <RemoveMediateurFromLieuButton
            structureId={canRemoveMediateurFromLieuId}
            mediateurId={acteur.mediateur.id}
          />
        )}
      </div>

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
      <Link href={acteurPageUrl} prefetch={false} />
    </article>
  )
}

export default ActeurCard

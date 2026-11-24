import classNames from 'classnames'
import Link from 'next/link'
import { routeConstruite } from '@/libraries/nextjs/route/route-construite'
import type { LienDeTri } from '../definition/composition'

export const EnTeteTriable = ({
  libelle,
  lien: { href, actif, ordre },
  className,
}: {
  libelle: string
  lien: LienDeTri
  className?: string | undefined
}) => {
  const montant = actif && ordre === 'asc'

  return (
    <th scope="col" className={className}>
      <Link
        className={classNames('lien-de-tri', {
          'lien-de-tri--inactif': !actif,
        })}
        title={`Trier par ${libelle}, ordre ${montant ? 'décroissant' : 'croissant'}`}
        href={routeConstruite(href)}
        scroll={false}
      >
        {libelle}
        <span
          className={classNames(
            'lien-de-tri__fleche',
            montant ? 'fr-icon-arrow-up-line' : 'fr-icon-arrow-down-line',
            'fr-icon--sm',
          )}
          aria-hidden="true"
        />
      </Link>
    </th>
  )
}

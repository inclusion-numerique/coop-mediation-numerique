import classNames from 'classnames'
import Link from 'next/link'
import { lienDuLieuDansLaCartographie } from '@/features/lieux-activite/ui/presenters/liens-de-la-cartographie.presenter'
import { TooltipIcon } from '@/libraries/ui/components'

import type { StatutCartographie } from '../presenters/statut-cartographie.presenter'

const CartographyIndicator = ({
  status,
  structureCartographieNationaleId,
  structureId,
  className,
}: {
  status: StatutCartographie
  structureCartographieNationaleId?: string | null
  structureId: string
  className?: string
}) => {
  const tooltipId = `tooltip-carto-${structureId}`

  if (status === 'visible' && structureCartographieNationaleId) {
    return (
      <Link
        className={classNames(
          'fr-tag fr-tag--sm',
          'fr-tag--carto-visible',
          className,
        )}
        href={lienDuLieuDansLaCartographie({
          structureCartographieNationaleId,
        })}
        target="_blank"
        rel="noreferrer"
      >
        <span
          className="fr-icon-france-fill fr-icon--sm fr-mr-1v"
          aria-hidden
        />
        Voir sur la cartographie
      </Link>
    )
  }

  if (status === 'pending') {
    return (
      <span className="fr-flex fr-align-items-center">
        <span
          className={classNames(
            'fr-tag fr-tag--sm',
            'fr-tag--carto-en-attente',
          )}
        >
          <span className="ri-loader-2-line fr-mr-1v" aria-hidden />
          En cours d'ajout sur la cartographie
          <TooltipIcon tooltipId={tooltipId} />
        </span>
        <span
          className="fr-tooltip fr-placement"
          id={tooltipId}
          role="tooltip"
          aria-hidden
        >
          Ce lieu d'activité sera visible sur la cartographie nationale dans un
          délai de 24h.
        </span>
      </span>
    )
  }

  if (status === 'updating' && structureCartographieNationaleId) {
    return (
      <span className="fr-flex fr-align-items-center">
        <Link
          className={classNames(
            'fr-tag fr-tag--sm',
            'fr-tag--carto-mise-a-jour',
            className,
          )}
          href={lienDuLieuDansLaCartographie({
            structureCartographieNationaleId,
          })}
          target="_blank"
          rel="noreferrer"
        >
          <span className="ri-loader-2-line fr-mr-1v" aria-hidden />
          Infos en cours de mise à jour sur la cartographie
          <TooltipIcon tooltipId={tooltipId} />
        </Link>
        <span
          className="fr-tooltip fr-placement"
          id={tooltipId}
          role="tooltip"
          aria-hidden
        >
          Les informations du lieu sont en cours de mise à jour, les dernières
          modifications seront visibles sur la cartographie nationale dans un
          délai de 24h.
        </span>
      </span>
    )
  }

  return (
    <span className="fr-flex fr-align-items-center">
      <span className={classNames('fr-tag fr-tag--sm', 'fr-tag--carto-absent')}>
        <span
          className="fr-icon-france-line fr-icon--sm fr-mr-1v"
          aria-hidden
        />
        Non répertorié sur la cartographie
        <TooltipIcon tooltipId={tooltipId} />
      </span>
      <span
        className="fr-tooltip fr-placement"
        id={tooltipId}
        role="tooltip"
        aria-hidden
      >
        Pour rendre visible ce lieu sur la cartographie nationale, activez la
        visibilité du lieu via le formulaire accessible en cliquant sur le
        bouton <strong>Modifier</strong>
      </span>
    </span>
  )
}

export default CartographyIndicator

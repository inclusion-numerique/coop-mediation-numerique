import { getStructureCartographieLink } from '@app/web/features/mon-reseau/use-cases/lieux/getStructureLink'
import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import styles from './CartographyIndicator.module.css'

export type CartographyStatus =
  | 'visible'
  | 'pending'
  | 'updating'
  | 'not_visible'

export const getCartographyStatus = ({
  visiblePourCartographieNationale,
  structureCartographieNationaleId,
  hasRecentModification,
}: {
  visiblePourCartographieNationale: boolean
  structureCartographieNationaleId: string | null
  hasRecentModification?: boolean
}): CartographyStatus => {
  if (visiblePourCartographieNationale && structureCartographieNationaleId) {
    // If recently modified, show updating status
    if (hasRecentModification) {
      return 'updating'
    }
    return 'visible'
  }
  if (visiblePourCartographieNationale) {
    return 'pending'
  }
  return 'not_visible'
}

const TooltipIcon = ({
  tooltipId,
  className,
}: {
  tooltipId: string
  className?: string
}) => (
  <>
    <button
      type="button"
      className={classNames(styles.tooltipButton, className)}
      aria-describedby={tooltipId}
    >
      <span className="ri-question-line" aria-hidden />
    </button>
  </>
)

const CartographyIndicator = ({
  status,
  structureCartographieNationaleId,
  structureId,
}: {
  status: CartographyStatus
  structureCartographieNationaleId?: string | null
  structureId: string
}) => {
  const tooltipId = `tooltip-carto-${structureId}`

  if (status === 'visible' && structureCartographieNationaleId) {
    return (
      <Link
        className={classNames('fr-tag fr-tag--sm', styles.tagVisible)}
        href={getStructureCartographieLink({
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
        <span className={classNames('fr-tag fr-tag--sm', styles.tagPending)}>
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

  if (status === 'updating') {
    return (
      <span className="fr-flex fr-align-items-center">
        <span className={classNames('fr-tag fr-tag--sm', styles.tagUpdating)}>
          <span className="ri-loader-2-line fr-mr-1v" aria-hidden />
          Infos en cours de mise à jour sur la cartographie
          <TooltipIcon tooltipId={tooltipId} />
        </span>
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

  // not_visible
  return (
    <span className="fr-flex fr-align-items-center">
      <span className={classNames('fr-tag fr-tag--sm', styles.tagNotVisible)}>
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

import TooltipIcon from '@app/ui/components/TooltipIcon'
import type { UserPublicActivityStatus } from '@app/web/features/utilisateurs/utils/getUserPublicActivityStatus'

const tooltipId = 'user-public-activity-status-badge-tooltip'

const UserPublicActivityStatusBadge = ({
  status: { status, label },
  size = 'sm',
}: {
  status: UserPublicActivityStatus
  size?: 'sm' | 'md' | 'lg'
}) => {
  const badgeVariant = status === 'actif' ? 'success' : 'warning'
  return (
    <span
      className={`fr-badge fr-badge--no-icon fr-badge--${badgeVariant} fr-badge--${size}`}
    >
      {label}

      {status === 'inactif' && (
        <>
          <TooltipIcon tooltipId={tooltipId} />
          <span
            className="fr-tooltip fr-placement"
            id={tooltipId}
            role="tooltip"
            aria-hidden
          >
            Un utilisateur est comptabilisé comme inactif à partir de 30 jours
            d’inactivité (30 jours sans avoir rempli au moins un CRA).
            <br />À noter&nbsp;: À partir de 6 mois d’inactivité, son compte
            sera supprimé.
          </span>
        </>
      )}
    </span>
  )
}

export default UserPublicActivityStatusBadge

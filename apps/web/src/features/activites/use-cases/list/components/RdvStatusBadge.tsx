import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import type { Rdv } from '@app/web/rdv-service-public/Rdv'
import type { RdvStatus } from '@app/web/rdv-service-public/rdvStatus'
import type { AlertProps } from '@codegouvfr/react-dsfr/Alert'
import Badge from '@codegouvfr/react-dsfr/Badge'

const statusBadgeProps: {
  [key in RdvStatus]: {
    severity: AlertProps.Severity | 'new'
    label: string
  }
} = {
  unknown: {
    severity: 'new',
    label: 'À venir',
  },
  seen: {
    severity: 'success',
    label: 'Honoré',
  },
  noshow: {
    severity: 'error',
    label: 'Absence',
  },
  excused: {
    severity: 'warning',
    label: 'Annulé par bénéficiaire',
  },
  revoked: {
    severity: 'warning',
    label: 'Annulé',
  },
  past: {
    severity: 'info',
    label: 'Passé',
  },
}

const RdvStatusBadge = ({
  rdv: { badgeStatus },
  className,
  pluralize,
}: {
  rdv: Pick<Rdv, 'badgeStatus'>
  className?: string
  pluralize?: number
}) => (
  <Badge
    small
    severity={statusBadgeProps[badgeStatus].severity}
    className={className}
  >
    {typeof pluralize === 'number'
      ? `Rdv ${statusBadgeProps[badgeStatus].label.toLowerCase()}${badgeStatus === 'past' || badgeStatus === 'seen' ? sPluriel(pluralize) : ''}`
      : statusBadgeProps[badgeStatus].label}
  </Badge>
)

export default RdvStatusBadge

import type { Rdv } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getRdvs'
import type { OAuthApiRdvStatus } from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import type { AlertProps } from '@codegouvfr/react-dsfr/Alert'
import Badge from '@codegouvfr/react-dsfr/Badge'

type RdvStatusBadgeVariant = OAuthApiRdvStatus | 'past'
const statusBadgeProps: {
  [key in RdvStatusBadgeVariant]: {
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
  rdv: { status, date },
  className,
}: { rdv: Pick<Rdv, 'status' | 'date'>; className?: string }) => {
  const now = Date.now()
  const badgeVariant: RdvStatusBadgeVariant =
    status === 'unknown' && date.getTime() < now ? 'past' : status
  return (
    <Badge
      small
      severity={statusBadgeProps[badgeVariant].severity}
      className={className}
    >
      {statusBadgeProps[badgeVariant].label}
    </Badge>
  )
}

export default RdvStatusBadge

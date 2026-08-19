import type { RdvStatus } from '@app/web/features/rdvsp/ui/rdv-status'
import { pluriel } from '@app/web/libraries/pluriel'
import type { AlertProps } from '@codegouvfr/react-dsfr/Alert'
import Badge from '@codegouvfr/react-dsfr/Badge'
import type { SearchRdvResultItem } from '../db/searchActiviteAndRdvs'

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

/**
 * Libellé du compteur, accordé au nombre.
 *
 * Seuls les états révolus se comptent : « À venir » ou « Annulé »
 * qualifient l'état, pas une quantité. Et zéro prend le singulier en
 * français — ce que l'ancien helper rendait faux, en affichant
 * « 0 Rdv passés ».
 */
const libelleAccorde = (badgeStatus: RdvStatus, nombre: number): string => {
  const libelle = statusBadgeProps[badgeStatus].label.toLowerCase()

  return badgeStatus === 'past' || badgeStatus === 'seen'
    ? pluriel(nombre, libelle, `${libelle}s`)
    : libelle
}

const RdvStatusBadge = ({
  rdv: { badgeStatus },
  className,
  pluralize,
}: {
  rdv: Pick<SearchRdvResultItem, 'badgeStatus'>
  className?: string
  pluralize?: number
}) => (
  <Badge
    small
    severity={statusBadgeProps[badgeStatus].severity}
    className={className}
  >
    {typeof pluralize === 'number'
      ? `Rdv ${libelleAccorde(badgeStatus, pluralize)}`
      : statusBadgeProps[badgeStatus].label}
  </Badge>
)

export default RdvStatusBadge

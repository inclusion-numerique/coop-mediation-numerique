import type { RdvStatus } from '@app/web/rdv-service-public/rdvStatus'

export const addRdvBadgeStatus = <
  T extends {
    endsAt: Date
    status: RdvStatus
  },
>(
  rdv: T,
): T & {
  badgeStatus: RdvStatus
} => ({
  ...rdv,
  badgeStatus:
    rdv.status === 'unknown' && rdv.endsAt.getTime() <= Date.now()
      ? 'past'
      : rdv.status,
})

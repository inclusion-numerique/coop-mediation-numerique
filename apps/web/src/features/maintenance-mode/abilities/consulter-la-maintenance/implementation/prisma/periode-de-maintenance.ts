import {
  MessageDeMaintenance,
  type PeriodeDeMaintenance,
} from '@app/web/features/maintenance-mode/domain'

export const periodeDeMaintenanceSelect = {
  id: true,
  startedAt: true,
  endedAt: true,
  message: true,
} as const

export const periodeDeMaintenance = (ligne: {
  id: string
  startedAt: Date
  endedAt: Date | null
  message: string | null
}): PeriodeDeMaintenance => ({
  id: ligne.id,
  debut: ligne.startedAt,
  fin: ligne.endedAt,
  message:
    ligne.message == null ? null : MessageDeMaintenance.safe(ligne.message),
})

export const periodeEnCoursWhere = { endedAt: null } as const

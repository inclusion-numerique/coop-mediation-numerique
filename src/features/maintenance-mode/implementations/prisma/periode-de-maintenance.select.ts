import { signaler } from '@/configuration/telemetry/serveur'
import {
  MessageDeMaintenance,
  type PeriodeDeMaintenance,
} from '@/features/maintenance-mode/domain'

export const periodeDeMaintenanceSelect = {
  id: true,
  startedAt: true,
  endedAt: true,
  message: true,
} as const

const messageLu = (message: string | null): MessageDeMaintenance | null => {
  if (message === null) return null

  const lu = MessageDeMaintenance.schema.safeParse(message)
  if (lu.success) return lu.data

  signaler(lu.error)
  return null
}

export const periodeDeMaintenance = (ligne: {
  id: string
  startedAt: Date
  endedAt: Date | null
  message: string | null
}): PeriodeDeMaintenance => ({
  id: ligne.id,
  debut: ligne.startedAt,
  fin: ligne.endedAt,
  message: messageLu(ligne.message),
})

export const periodeEnCoursWhere = { endedAt: null } as const

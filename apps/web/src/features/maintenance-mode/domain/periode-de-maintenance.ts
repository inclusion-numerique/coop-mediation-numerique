import type { MessageDeMaintenance } from './message-de-maintenance'

export type PeriodeDeMaintenance = {
  readonly id: string
  readonly debut: Date
  readonly fin: Date | null
  readonly message: MessageDeMaintenance | null
}

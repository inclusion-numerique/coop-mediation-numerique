import { Itinerance } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Itinerance as ItineranceCoop } from '@prisma/client'
import { pont } from './pont'

const table: Record<ItineranceCoop, Itinerance> = {
  Itinerant: Itinerance.Itinerant,
  Fixe: Itinerance.Fixe,
}

export const itinerance = pont(table)

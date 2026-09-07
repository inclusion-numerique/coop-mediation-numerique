import { Itinerance } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { pont } from './pont'

const table = {
  Itinerant: Itinerance.Itinerant,
  Fixe: Itinerance.Fixe,
} satisfies Record<string, Itinerance>

export type ItineranceCoop = keyof typeof table

export const itinerance = pont(Itinerance, table)

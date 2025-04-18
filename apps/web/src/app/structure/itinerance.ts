import { Itinerance } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { Itinerance as PrismaItinerance } from '@prisma/client'

export const itineranceLabels: Record<PrismaItinerance, Itinerance> = {
  Itinerant: Itinerance.Itinerant,
  Fixe: Itinerance.Fixe,
}

export const itineranceKeys: Record<Itinerance, PrismaItinerance> =
  Object.fromEntries(
    Object.entries(itineranceLabels).map(([key, value]) => [value, key]),
  ) as Record<Itinerance, PrismaItinerance>

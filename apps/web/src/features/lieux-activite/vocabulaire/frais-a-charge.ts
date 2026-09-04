import { Frais } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { FraisACharge as FraisAChargeCoop } from '@prisma/client'
import { pont } from './pont'

const table: Record<FraisAChargeCoop, Frais> = {
  Gratuit: Frais.Gratuit,
  GratuitSousCondition: Frais.GratuitSousCondition,
  Payant: Frais.Payant,
}

export const fraisACharge = pont(table)

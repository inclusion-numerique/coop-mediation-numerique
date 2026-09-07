import { Frais } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { pont } from './pont'

const table = {
  Gratuit: Frais.Gratuit,
  GratuitSousCondition: Frais.GratuitSousCondition,
  Payant: Frais.Payant,
} satisfies Record<string, Frais>

export type FraisAChargeCoop = keyof typeof table

export const fraisACharge = pont(Frais, table)

import { PriseEnChargeSpecifique } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { pont } from './pont'

const table = {
  Surdite: PriseEnChargeSpecifique.Surdite,
  HandicapsMoteurs: PriseEnChargeSpecifique.HandicapsMoteurs,
  HandicapsMentaux: PriseEnChargeSpecifique.HandicapsMentaux,
  Illettrisme: PriseEnChargeSpecifique.Illettrisme,
  LanguesEtrangeresAnglais: PriseEnChargeSpecifique.LanguesEtrangeresAnglais,
  LanguesEtrangeresAutre: PriseEnChargeSpecifique.LanguesEtrangeresAutre,
  DeficienceVisuelle: PriseEnChargeSpecifique.DeficienceVisuelle,
} satisfies Record<string, PriseEnChargeSpecifique>

export type PriseEnChargeSpecifiqueCoop = keyof typeof table

export const priseEnChargeSpecifique = pont(PriseEnChargeSpecifique, table)

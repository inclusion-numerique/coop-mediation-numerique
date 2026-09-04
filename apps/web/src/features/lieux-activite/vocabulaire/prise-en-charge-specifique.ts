import { PriseEnChargeSpecifique } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { PriseEnChargeSpecifique as PriseEnChargeSpecifiqueCoop } from '@prisma/client'
import { pont } from './pont'

const table: Record<PriseEnChargeSpecifiqueCoop, PriseEnChargeSpecifique> = {
  Surdite: PriseEnChargeSpecifique.Surdite,
  HandicapsMoteurs: PriseEnChargeSpecifique.HandicapsMoteurs,
  HandicapsMentaux: PriseEnChargeSpecifique.HandicapsMentaux,
  Illettrisme: PriseEnChargeSpecifique.Illettrisme,
  LanguesEtrangeresAnglais: PriseEnChargeSpecifique.LanguesEtrangeresAnglais,
  LanguesEtrangeresAutre: PriseEnChargeSpecifique.LanguesEtrangeresAutre,
  DeficienceVisuelle: PriseEnChargeSpecifique.DeficienceVisuelle,
}

export const priseEnChargeSpecifique = pont(table)

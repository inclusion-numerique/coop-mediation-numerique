import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { PriseEnChargeSpecifique } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { PriseEnChargeSpecifique as PrismaPriseEnChargeSpecifique } from '@prisma/client'

export const priseEnChargeSpecifiqueLabels: Record<
  PrismaPriseEnChargeSpecifique,
  PriseEnChargeSpecifique
> = {
  Surdite: PriseEnChargeSpecifique.Surdite,
  HandicapsMoteurs: PriseEnChargeSpecifique.HandicapsMoteurs,
  HandicapsMentaux: PriseEnChargeSpecifique.HandicapsMentaux,
  Illettrisme: PriseEnChargeSpecifique.Illettrisme,
  LanguesEtrangeresAnglais: PriseEnChargeSpecifique.LanguesEtrangeresAnglais,
  LanguesEtrangeresAutre: PriseEnChargeSpecifique.LanguesEtrangeresAutre,
  DeficienceVisuelle: PriseEnChargeSpecifique.DeficienceVisuelle,
}

export type PriseEnChargeSpecifiqueLabel =
  keyof typeof priseEnChargeSpecifiqueLabels

export const priseEnChargeSpecifiqueValues = Object.keys(
  priseEnChargeSpecifiqueLabels,
) as [PriseEnChargeSpecifiqueLabel, ...PriseEnChargeSpecifiqueLabel[]]

export const priseEnChargeSpecifiqueOptions = labelsToOptions(
  priseEnChargeSpecifiqueLabels,
)

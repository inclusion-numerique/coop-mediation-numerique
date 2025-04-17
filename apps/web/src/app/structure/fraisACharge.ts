import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { Frais } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { FraisACharge as PrismaFraisACharge } from '@prisma/client'

export const fraisAChargeLabels: Record<PrismaFraisACharge, Frais> = {
  Gratuit: Frais.Gratuit,
  GratuitSousCondition: Frais.GratuitSousCondition,
  Payant: Frais.Payant,
}

export const fraisAChargeKeys: Record<Frais, PrismaFraisACharge> =
  Object.fromEntries(
    Object.entries(fraisAChargeLabels).map(([key, value]) => [value, key]),
  ) as Record<Frais, PrismaFraisACharge>

export type FraisAChargeLabel = keyof typeof fraisAChargeLabels

export const fraisAChargeValues = Object.keys(fraisAChargeLabels) as [
  FraisAChargeLabel,
  ...FraisAChargeLabel[],
]

export const fraisAChargeStructureHints: {
  [key in FraisAChargeLabel]: string
} = {
  Gratuit: 'Accès gratuit au lieu et à ses services',
  GratuitSousCondition:
    'La gratuité est conditionnée à des critères (adhésion, situation familiale, convention avec un organisme social, pass numériques…)',
  Payant: 'L’accès au lieu et/ou à ses services est payant',
}

export const fraisAChargeOptions = labelsToOptions(fraisAChargeLabels, {
  hints: fraisAChargeStructureHints,
})

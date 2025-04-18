import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { PublicSpecifiquementAdresse } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { PublicSpecifiquementAdresse as PrismaPublicSpecifiquementAdresse } from '@prisma/client'

export const publicSpecifiquementAdresseLabels: Record<
  PrismaPublicSpecifiquementAdresse,
  PublicSpecifiquementAdresse
> = {
  Jeunes: PublicSpecifiquementAdresse.Jeunes,
  Etudiants: PublicSpecifiquementAdresse.Etudiants,
  FamillesEnfants: PublicSpecifiquementAdresse.FamillesEnfants,
  Seniors: PublicSpecifiquementAdresse.Seniors,
  Femmes: PublicSpecifiquementAdresse.Femmes,
}

export const publicSpecifiquementAdresseKeys: Record<
  PublicSpecifiquementAdresse,
  PrismaPublicSpecifiquementAdresse
> = Object.fromEntries(
  Object.entries(publicSpecifiquementAdresseLabels).map(([key, value]) => [
    value,
    key,
  ]),
) as Record<PublicSpecifiquementAdresse, PrismaPublicSpecifiquementAdresse>

export type PublicSpecifiquementAdresseLabel =
  keyof typeof publicSpecifiquementAdresseLabels

export const publicSpecifiquementAdresseValues = Object.keys(
  publicSpecifiquementAdresseLabels,
) as [PublicSpecifiquementAdresseLabel, ...PublicSpecifiquementAdresseLabel[]]

export const publicSpecifiquementAdresseOptions = labelsToOptions(
  publicSpecifiquementAdresseLabels,
)

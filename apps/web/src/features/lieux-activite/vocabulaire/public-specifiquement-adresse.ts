import { PublicSpecifiquementAdresse } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { pont } from './pont'

const table = {
  Jeunes: PublicSpecifiquementAdresse.Jeunes,
  Etudiants: PublicSpecifiquementAdresse.Etudiants,
  FamillesEnfants: PublicSpecifiquementAdresse.FamillesEnfants,
  Seniors: PublicSpecifiquementAdresse.Seniors,
  Femmes: PublicSpecifiquementAdresse.Femmes,
} satisfies Record<string, PublicSpecifiquementAdresse>

export type PublicSpecifiquementAdresseCoop = keyof typeof table

export const publicSpecifiquementAdresse = pont(
  PublicSpecifiquementAdresse,
  table,
)

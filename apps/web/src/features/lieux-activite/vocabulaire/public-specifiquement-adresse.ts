import { PublicSpecifiquementAdresse } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { PublicSpecifiquementAdresse as PublicSpecifiquementAdresseCoop } from '@prisma/client'
import { pont } from './pont'

const table: Record<
  PublicSpecifiquementAdresseCoop,
  PublicSpecifiquementAdresse
> = {
  Jeunes: PublicSpecifiquementAdresse.Jeunes,
  Etudiants: PublicSpecifiquementAdresse.Etudiants,
  FamillesEnfants: PublicSpecifiquementAdresse.FamillesEnfants,
  Seniors: PublicSpecifiquementAdresse.Seniors,
  Femmes: PublicSpecifiquementAdresse.Femmes,
}

export const publicSpecifiquementAdresse = pont(table)

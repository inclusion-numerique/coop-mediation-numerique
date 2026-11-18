import { HorairesValidation } from '@/features/lieux-activite/domain/horaires.validation'
import {
  FicheAccesLibreSaisie,
  PriseRdvSaisie,
  SiteWebSaisi,
  texteFacultatif,
} from '@/features/lieux-activite/domain/regles-de-saisie'

export const InformationsPratiquesShape = {
  siteWeb: SiteWebSaisi,
  ficheAccesLibre: FicheAccesLibreSaisie,
  priseRdv: PriseRdvSaisie,
  horairesComment: texteFacultatif,
  openingHours: HorairesValidation,
}

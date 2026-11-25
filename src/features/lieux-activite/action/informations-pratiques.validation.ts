import { HorairesValidation } from '@/features/lieux-activite/action/horaires.validation'
import {
  FicheAccesLibreSaisie,
  PriseRdvSaisie,
  SiteWebSaisi,
  texteFacultatif,
} from '@/features/lieux-activite/domain/saisie/regles-de-saisie'

export const InformationsPratiquesShape = {
  siteWeb: SiteWebSaisi,
  ficheAccesLibre: FicheAccesLibreSaisie,
  priseRdv: PriseRdvSaisie,
  horairesComment: texteFacultatif,
  openingHours: HorairesValidation,
}

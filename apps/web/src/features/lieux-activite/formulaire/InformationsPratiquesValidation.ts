import { HorairesValidation } from '@app/web/features/lieux-activite/domain/horaires.validation'
import {
  FicheAccesLibreSaisie,
  PriseRdvSaisie,
  SiteWebSaisi,
  texteFacultatif,
} from '@app/web/features/lieux-activite/domain/regles-de-saisie'

export const InformationsPratiquesShape = {
  siteWeb: SiteWebSaisi,
  ficheAccesLibre: FicheAccesLibreSaisie,
  priseRdv: PriseRdvSaisie,
  horairesComment: texteFacultatif,
  openingHours: HorairesValidation,
}

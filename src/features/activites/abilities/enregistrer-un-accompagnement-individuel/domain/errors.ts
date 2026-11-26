import type {
  ActionNonAutorisee,
  ActiviteIntrouvable,
  BeneficiaireIntrouvable,
  DateTropLointaine,
  LieuInutilisable,
  RendezVousIndisponible,
  TagInutilisable,
  TypeDActiviteIncompatible,
} from '../../../domain'

export type EchecDEnregistrerUnAccompagnementIndividuel =
  | ActionNonAutorisee
  | ActiviteIntrouvable
  | TypeDActiviteIncompatible
  | BeneficiaireIntrouvable
  | LieuInutilisable
  | TagInutilisable
  | RendezVousIndisponible
  | DateTropLointaine

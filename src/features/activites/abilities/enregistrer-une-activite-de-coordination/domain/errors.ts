import type {
  ActionNonAutorisee,
  ActiviteIntrouvable,
  DateTropLointaine,
  TagInutilisable,
  TypeDActiviteIncompatible,
} from '../../../domain'

export type EchecDEnregistrerUneActiviteDeCoordination =
  | ActionNonAutorisee
  | ActiviteIntrouvable
  | TypeDActiviteIncompatible
  | TagInutilisable
  | DateTropLointaine

import type {
  ActionNonAutorisee,
  ActiviteIntrouvable,
  AtelierSansParticipant,
  BeneficiaireEnDouble,
  BeneficiaireIntrouvable,
  DateTropLointaine,
  LieuInutilisable,
  RendezVousIndisponible,
  TagInutilisable,
  TypeDActiviteIncompatible,
} from '../../../domain'

export type EchecDEnregistrerUnAtelierCollectif =
  | ActionNonAutorisee
  | ActiviteIntrouvable
  | TypeDActiviteIncompatible
  | BeneficiaireIntrouvable
  | BeneficiaireEnDouble
  | AtelierSansParticipant
  | LieuInutilisable
  | TagInutilisable
  | RendezVousIndisponible
  | DateTropLointaine

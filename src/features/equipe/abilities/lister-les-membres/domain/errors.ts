import type {
  ConsultationNonAutorisee,
  CoordinateurIntrouvable,
} from '../../../domain'

export type EchecDeListerLesMembres =
  | ConsultationNonAutorisee
  | CoordinateurIntrouvable

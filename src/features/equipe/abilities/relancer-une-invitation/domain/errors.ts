import type {
  ActionNonAutorisee,
  CoordinateurIntrouvable,
  EnvoiEchoue,
  InvitationDejaTraitee,
  InvitationIntrouvable,
  RelanceTropRecente,
} from '../../../domain'

export type EchecDeRelance =
  | ActionNonAutorisee
  | InvitationIntrouvable
  | InvitationDejaTraitee
  | RelanceTropRecente
  | CoordinateurIntrouvable
  | EnvoiEchoue

import type {
  ActionNonAutorisee,
  CoordinateurIntrouvable,
  EnvoiEchoue,
  InvitationDejaTraitee,
  InvitationIntrouvable,
  RelanceTropRecente,
} from '../../../domain'

export type EchecDeRelancerUneInvitation =
  | ActionNonAutorisee
  | InvitationIntrouvable
  | InvitationDejaTraitee
  | RelanceTropRecente
  | CoordinateurIntrouvable
  | EnvoiEchoue

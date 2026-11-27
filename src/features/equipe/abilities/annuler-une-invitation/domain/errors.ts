import type {
  ActionNonAutorisee,
  InvitationDejaTraitee,
  InvitationIntrouvable,
} from '../../../domain'

export type EchecDeAnnulerUneInvitation =
  | ActionNonAutorisee
  | InvitationIntrouvable
  | InvitationDejaTraitee

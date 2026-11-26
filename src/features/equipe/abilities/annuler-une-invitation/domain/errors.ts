import type {
  ActionNonAutorisee,
  InvitationDejaTraitee,
  InvitationIntrouvable,
} from '../../../domain'

export type EchecDAnnulation =
  | ActionNonAutorisee
  | InvitationIntrouvable
  | InvitationDejaTraitee

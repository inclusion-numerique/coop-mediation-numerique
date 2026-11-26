import type {
  ActionNonAutorisee,
  CoordinateurIntrouvable,
} from '../../../domain'
import type { Ecart } from './ecart'

export type AucuneInvitationAEnvoyer = {
  readonly _tag: 'AucuneInvitationAEnvoyer'
  readonly ecartes: readonly Ecart[]
}

export const AucuneInvitationAEnvoyer = (
  ecartes: readonly Ecart[],
): AucuneInvitationAEnvoyer => ({ _tag: 'AucuneInvitationAEnvoyer', ecartes })

export type EchecDInvitation =
  | ActionNonAutorisee
  | AucuneInvitationAEnvoyer
  | CoordinateurIntrouvable

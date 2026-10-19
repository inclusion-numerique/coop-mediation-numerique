import type { Ecart } from './planifier'

export type AucuneInvitationAEnvoyer = {
  readonly _tag: 'AucuneInvitationAEnvoyer'
  readonly ecartes: readonly Ecart[]
}

export const AucuneInvitationAEnvoyer = (
  ecartes: readonly Ecart[],
): AucuneInvitationAEnvoyer => ({ _tag: 'AucuneInvitationAEnvoyer', ecartes })

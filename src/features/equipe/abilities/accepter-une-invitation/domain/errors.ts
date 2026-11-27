import type {
  InvitationDejaTraitee,
  InvitationIntrouvable,
} from '../../../domain'

export type MauvaisDestinataire = { readonly _tag: 'MauvaisDestinataire' }

export const MauvaisDestinataire = (): MauvaisDestinataire => ({
  _tag: 'MauvaisDestinataire',
})

export type InscriptionNonValidee = { readonly _tag: 'InscriptionNonValidee' }

export const InscriptionNonValidee = (): InscriptionNonValidee => ({
  _tag: 'InscriptionNonValidee',
})

export type EchecDeAccepterUneInvitation =
  | InvitationIntrouvable
  | InvitationDejaTraitee
  | MauvaisDestinataire
  | InscriptionNonValidee

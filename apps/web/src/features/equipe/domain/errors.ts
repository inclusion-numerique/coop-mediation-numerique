import type { MediateurId } from './mediateur-id'
import type { ReferenceInvitation } from './reference-invitation'

export type InvitationIntrouvable = { readonly _tag: 'InvitationIntrouvable' }

export const InvitationIntrouvable = (): InvitationIntrouvable => ({
  _tag: 'InvitationIntrouvable',
})

export type InvitationDejaTraitee = {
  readonly _tag: 'InvitationDejaTraitee'
  readonly reference: ReferenceInvitation
  readonly statut: 'Acceptee' | 'Refusee'
}

export const InvitationDejaTraitee = (
  reference: ReferenceInvitation,
  statut: 'Acceptee' | 'Refusee',
): InvitationDejaTraitee => ({
  _tag: 'InvitationDejaTraitee',
  reference,
  statut,
})

export type DejaMembre = {
  readonly _tag: 'DejaMembre'
  readonly mediateurId: MediateurId
}

export const DejaMembre = (mediateurId: MediateurId): DejaMembre => ({
  _tag: 'DejaMembre',
  mediateurId,
})

export type PasMembre = { readonly _tag: 'PasMembre' }

export const PasMembre = (): PasMembre => ({ _tag: 'PasMembre' })

export type ActionNonAutorisee = { readonly _tag: 'ActionNonAutorisee' }

export const ActionNonAutorisee = (): ActionNonAutorisee => ({
  _tag: 'ActionNonAutorisee',
})

export type EnvoiEchoue = { readonly _tag: 'EnvoiEchoue' }

export const EnvoiEchoue = (): EnvoiEchoue => ({ _tag: 'EnvoiEchoue' })

export type CoordinateurIntrouvable = {
  readonly _tag: 'CoordinateurIntrouvable'
}

export const CoordinateurIntrouvable = (): CoordinateurIntrouvable => ({
  _tag: 'CoordinateurIntrouvable',
})

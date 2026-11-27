import type {
  MediateurId,
  NouvelleAdhesion,
  Prevenance,
  ReferenceInvitation,
  UtilisateurId,
} from '../../../domain'

export type AdhesionALAcceptation =
  | { readonly _tag: 'DejaMembre' }
  | (NouvelleAdhesion & { readonly _tag: 'NouvelleAdhesion' })

export type Acceptation = {
  readonly reference: ReferenceInvitation
  readonly mediateurId: MediateurId
  readonly auteurId: UtilisateurId
  readonly accepteeLe: Date
  readonly adhesion: AdhesionALAcceptation
}

export type AcceptationEnregistree = {
  readonly acceptation: Acceptation
  readonly prevenance: Prevenance | null
}

import type {
  MediateurId,
  NouvelleAdhesion,
  Prevenance,
  ReferenceInvitation,
  UtilisateurId,
} from '../../../domain'

export type Acceptation = {
  readonly reference: ReferenceInvitation
  readonly mediateurId: MediateurId
  readonly auteurId: UtilisateurId
  readonly accepteeLe: Date
  readonly adhesion: NouvelleAdhesion | null
}

export type AcceptationEnregistree = {
  readonly acceptation: Acceptation
  readonly prevenance: Prevenance | null
}

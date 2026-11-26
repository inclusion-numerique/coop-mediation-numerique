import type {
  CoordinateurId,
  Courriel,
  Invitation,
  MediateurId,
  ReferenceInvitation,
} from '../../../domain'

export type MediateurInvite = {
  readonly mediateurId: MediateurId
  readonly email: Courriel
}

export type InvitationsAcceptees = {
  readonly type: 'Acceptees'
  readonly mediateurId: MediateurId
  readonly acceptees: readonly ReferenceInvitation[]
  readonly accepteesLe: Date
  readonly equipes: readonly CoordinateurId[]
}

export type AcceptationsEnAttente =
  | { readonly type: 'SansCompteMediateur' }
  | InvitationsAcceptees

const referencesEnAttente = (
  invitations: readonly Invitation[],
): readonly ReferenceInvitation[] =>
  invitations
    .filter(({ statut }) => statut === 'EnAttente')
    .map(({ reference }) => reference)

const equipesARejoindre = (
  invitations: readonly Invitation[],
): readonly CoordinateurId[] =>
  invitations
    .filter(({ statut }) => statut !== 'Refusee')
    .map(({ reference }) => reference.coordinateurId)

export const acceptationsEnAttente = ({
  mediateur,
  invitations,
  maintenant,
}: {
  readonly mediateur: MediateurInvite
  readonly invitations: readonly Invitation[]
  readonly maintenant: Date
}): InvitationsAcceptees => ({
  type: 'Acceptees',
  mediateurId: mediateur.mediateurId,
  acceptees: referencesEnAttente(invitations),
  accepteesLe: maintenant,
  equipes: equipesARejoindre(invitations),
})

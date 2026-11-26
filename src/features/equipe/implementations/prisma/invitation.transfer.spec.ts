import { describe, expect, it } from 'vitest'
import { CoordinateurId } from '../../domain/identifiants/coordinateur-id'
import { MediateurId } from '../../domain/identifiants/mediateur-id'
import { Courriel } from '../../domain/identite/courriel'
import {
  type InvitationAcceptee,
  type InvitationEnAttente,
  type InvitationRefusee,
} from '../../domain/invitation/invitation'
import { ReferenceInvitation } from '../../domain/invitation/reference-invitation'
import {
  fromInvitation,
  type InvitationRow,
  toInvitation,
} from './invitation.transfer'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440011')

const email = Courriel('invite@example.com')

const reference = ReferenceInvitation({ email, coordinateurId })

const invitationEnAttente: InvitationEnAttente = {
  reference,
  invite: { type: 'SansCompte' },
  envoyeeLe: new Date('2026-01-01T09:00:00Z'),
  renvoyeeLe: null,
  statut: 'EnAttente',
}

const invitationAcceptee: InvitationAcceptee = {
  ...invitationEnAttente,
  invite: { type: 'MediateurInscrit', mediateurId },
  renvoyeeLe: new Date('2026-01-05T09:00:00Z'),
  statut: 'Acceptee',
  accepteeLe: new Date('2026-01-06T09:00:00Z'),
}

const invitationRefusee: InvitationRefusee = {
  ...invitationEnAttente,
  statut: 'Refusee',
  refuseeLe: new Date('2026-01-03T09:00:00Z'),
}

describe('transfert d’une invitation', () => {
  it.each([
    ['en attente, sans compte, jamais renvoyée', invitationEnAttente],
    ['acceptée par un médiateur inscrit, renvoyée', invitationAcceptee],
    ['refusée', invitationRefusee],
  ])('fait l’aller-retour : %s', (_, invitation) => {
    expect(toInvitation(fromInvitation(invitation))).toEqual(invitation)
  })

  it('ramène un email saisi en majuscules à sa forme canonique', () => {
    const invitation = toInvitation({
      ...fromInvitation(invitationEnAttente),
      email: 'Invite@Example.COM',
    })

    expect(invitation?.reference.email).toBe('invite@example.com')
  })

  it('tient pour acceptée une invitation à la fois acceptée et refusée', () => {
    const invitation = toInvitation({
      ...fromInvitation(invitationAcceptee),
      refusee: new Date('2026-01-07T09:00:00Z'),
    })

    expect(invitation?.statut).toBe('Acceptee')
  })

  it.each<[string, Partial<InvitationRow>]>([
    ['l’email est inexploitable', { email: 'x' }],
    ['l’identifiant du coordinateur est illisible', { coordinateurId: 'x' }],
    ['l’identifiant du médiateur est illisible', { mediateurId: 'x' }],
  ])('refuse une ligne dont %s', (_, invalide) => {
    expect(() =>
      toInvitation({ ...fromInvitation(invitationEnAttente), ...invalide }),
    ).toThrow()
  })
})

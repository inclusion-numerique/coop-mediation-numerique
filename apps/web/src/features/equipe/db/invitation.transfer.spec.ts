import {
  invitationAcceptee,
  invitationEnAttente,
  invitationRefusee,
} from '../domain/fixtures'
import { fromInvitation, toInvitation } from './invitation.transfer'

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

  it('écarte une ligne dont l’email est inexploitable', () => {
    expect(
      toInvitation({ ...fromInvitation(invitationEnAttente), email: 'x' }),
    ).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { Courriel, MediateurId } from '../../../domain'
import { CoordinateurId } from '../../../domain/identifiants/coordinateur-id'
import {
  type InvitationAcceptee,
  type InvitationEnAttente,
} from '../../../domain/invitation/invitation'
import { ReferenceInvitation } from '../../../domain/invitation/reference-invitation'
import { accepter } from './accepter'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const mediateurDeLInvitation = MediateurId(
  '550e8400-e29b-41d4-a716-446655440011',
)

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
  invite: { type: 'MediateurInscrit', mediateurId: mediateurDeLInvitation },
  renvoyeeLe: new Date('2026-01-05T09:00:00Z'),
  statut: 'Acceptee',
  accepteeLe: new Date('2026-01-06T09:00:00Z'),
}

const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440031')

describe('accepter une invitation', () => {
  it('rattache le médiateur de la session, pas celui noté sur l’invitation', () => {
    expect(
      accepter(invitationEnAttente, {
        type: 'InscriptionValidee',
        email,
        mediateurId,
      }),
    ).toEqual({
      success: true,
      data: { invitation: invitationEnAttente, mediateurId },
    })
  })

  it('est réservé à la personne invitée', () => {
    expect(
      accepter(invitationEnAttente, {
        type: 'InscriptionValidee',
        email: Courriel('quelqu-un-d-autre@example.com'),
        mediateurId,
      }),
    ).toEqual({ success: false, error: { _tag: 'MauvaisDestinataire' } })
  })

  it('attend la fin de l’inscription', () => {
    expect(
      accepter(invitationEnAttente, { type: 'InscriptionEnCours', email }),
    ).toEqual({ success: false, error: { _tag: 'InscriptionNonValidee' } })
  })

  it('ne se fait qu’une fois', () => {
    expect(
      accepter(invitationAcceptee, {
        type: 'InscriptionValidee',
        email,
        mediateurId,
      }),
    ).toEqual({
      success: false,
      error: expect.objectContaining({ _tag: 'InvitationDejaTraitee' }),
    })
  })
})

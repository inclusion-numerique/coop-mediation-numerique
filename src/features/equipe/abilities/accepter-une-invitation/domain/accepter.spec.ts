import { describe, expect, it } from 'vitest'
import { Courriel, MediateurId } from '../../../domain'
import {
  email,
  invitationAcceptee,
  invitationEnAttente,
} from '../../../fixtures/domaine'
import { accepter } from './accepter'

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

import {
  invitationAcceptee,
  invitationEnAttente,
  invitationRefusee,
} from './fixtures'
import { exigerEnAttente } from './invitation'

describe('une invitation ne se traite qu’une fois', () => {
  it('une invitation en attente peut encore l’être', () => {
    expect(exigerEnAttente(invitationEnAttente)).toEqual({
      success: true,
      data: invitationEnAttente,
    })
  })

  it.each([
    [invitationAcceptee, 'Acceptee'],
    [invitationRefusee, 'Refusee'],
  ])('une invitation déjà traitée ne le peut plus', (invitation, statut) => {
    expect(exigerEnAttente(invitation)).toEqual({
      success: false,
      error: expect.objectContaining({ _tag: 'InvitationDejaTraitee', statut }),
    })
  })
})

import { Email } from '../../../domain'
import {
  coordinateurDeLEquipe,
  email,
  invitationEnAttente,
  invitationRefusee,
} from '../../../domain/fixtures'
import { vueInvitation } from './vue-invitation'

const coordinateur = coordinateurDeLEquipe

describe('ce que voit une personne qui ouvre son invitation', () => {
  it('l’invitation en attente, connectée avec la bonne adresse', () => {
    expect(
      vueInvitation({
        invitation: invitationEnAttente,
        session: email,
        coordinateur,
        tailleEquipe: 3,
      }),
    ).toEqual({
      type: 'EnAttente',
      reference: invitationEnAttente.reference,
      coordinateur,
      tailleEquipe: 3,
      connecte: true,
    })
  })

  it('l’invitation en attente, sans être connectée', () => {
    expect(
      vueInvitation({
        invitation: invitationEnAttente,
        session: null,
        coordinateur,
        tailleEquipe: 3,
      }),
    ).toEqual(expect.objectContaining({ type: 'EnAttente', connecte: false }))
  })

  it('un avertissement quand elle est connectée avec une autre adresse', () => {
    expect(
      vueInvitation({
        invitation: invitationEnAttente,
        session: Email('autre@example.com'),
        coordinateur,
        tailleEquipe: 3,
      }),
    ).toEqual({ type: 'MauvaisDestinataire' })
  })

  it('une invitation déjà traitée', () => {
    expect(
      vueInvitation({
        invitation: invitationRefusee,
        session: null,
        coordinateur,
        tailleEquipe: 3,
      }),
    ).toEqual({ type: 'DejaTraitee' })
  })

  it('une invitation qui n’existe plus', () => {
    expect(
      vueInvitation({
        invitation: null,
        session: null,
        coordinateur,
        tailleEquipe: 0,
      }),
    ).toEqual({ type: 'DejaTraitee' })
  })
})

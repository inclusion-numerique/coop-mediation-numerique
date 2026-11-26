import { describe, expect, it } from 'vitest'
import {
  type CoordinateurDeLEquipe,
  CoordinateurId,
  Courriel,
  NomAffiche,
  ReferenceInvitation,
} from '../../../domain'
import type {
  InvitationEnAttente,
  InvitationRefusee,
} from '../../../domain/invitation/invitation'
import { consulterUneInvitation } from './consulter-une-invitation'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const email = Courriel('invite@example.com')

const reference = ReferenceInvitation({ email, coordinateurId })

const invitationEnAttente: InvitationEnAttente = {
  reference,
  invite: { type: 'SansCompte' },
  envoyeeLe: new Date('2026-01-01T09:00:00Z'),
  renvoyeeLe: null,
  statut: 'EnAttente',
}

const invitationRefusee: InvitationRefusee = {
  ...invitationEnAttente,
  statut: 'Refusee',
  refuseeLe: new Date('2026-01-03T09:00:00Z'),
}

const coordinateur: CoordinateurDeLEquipe = {
  nom: NomAffiche('Camille Coordinatrice'),
  email: Courriel('camille@example.com'),
  telephone: null,
}

const enAttente = consulterUneInvitation({
  lireUneInvitation: async () => ({ invitation: invitationEnAttente, cle: 1 }),
  lireLeCoordinateur: async () => coordinateur,
  compterLesMembresActifs: async () => 3,
})

describe('ce que voit une personne qui ouvre son invitation', () => {
  it('l’invitation en attente, connectée avec la bonne adresse', async () => {
    expect(await enAttente({ reference, session: email })).toEqual({
      success: true,
      data: {
        type: 'EnAttente',
        reference,
        coordinateur,
        tailleEquipe: 3,
        connecte: true,
      },
    })
  })

  it('l’invitation en attente, sans être connectée', async () => {
    expect(await enAttente({ reference, session: null })).toEqual({
      success: true,
      data: {
        type: 'EnAttente',
        reference,
        coordinateur,
        tailleEquipe: 3,
        connecte: false,
      },
    })
  })

  it('un avertissement quand elle est connectée avec une autre adresse', async () => {
    expect(
      await enAttente({ reference, session: Courriel('autre@example.com') }),
    ).toEqual({ success: true, data: { type: 'MauvaisDestinataire' } })
  })

  it('un lien illisible', async () => {
    expect(await enAttente({ reference: null, session: email })).toEqual({
      success: true,
      data: { type: 'Illisible' },
    })
  })

  it('une invitation déjà traitée', async () => {
    const consulter = consulterUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationRefusee,
        cle: 1,
      }),
      lireLeCoordinateur: async () => coordinateur,
      compterLesMembresActifs: async () => 3,
    })

    expect(await consulter({ reference, session: null })).toEqual({
      success: true,
      data: { type: 'DejaTraitee' },
    })
  })

  it('une invitation qui n’existe plus', async () => {
    const consulter = consulterUneInvitation({
      lireUneInvitation: async () => null,
      lireLeCoordinateur: async () => coordinateur,
      compterLesMembresActifs: async () => 0,
    })

    expect(await consulter({ reference, session: null })).toEqual({
      success: true,
      data: { type: 'DejaTraitee' },
    })
  })

  it('une invitation dont le coordinateur n’existe plus', async () => {
    const consulter = consulterUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationEnAttente,
        cle: 1,
      }),
      lireLeCoordinateur: async () => null,
      compterLesMembresActifs: async () => 0,
    })

    expect(await consulter({ reference, session: null })).toEqual({
      success: true,
      data: { type: 'DejaTraitee' },
    })
  })
})

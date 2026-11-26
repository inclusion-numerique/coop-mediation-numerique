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
import { refuserUneInvitation } from './refuser-une-invitation'

const reference = ReferenceInvitation({
  email: Courriel('invite@example.com'),
  coordinateurId: CoordinateurId('550e8400-e29b-41d4-a716-446655440001'),
})

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
  nom: NomAffiche('Camille Martin'),
  email: Courriel('camille.martin@example.com'),
  telephone: null,
}

const maintenant = new Date('2026-01-10T09:00:00Z')

describe('refuser une invitation', () => {
  it('refuse une invitation en attente', async () => {
    const refuser = refuserUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationEnAttente,
        cle: 1,
      }),
      enregistrerLeRefus: async () => undefined,
      lireLeCoordinateur: async () => coordinateur,
      prevenirLeCoordinateur: async () => undefined,
    })

    expect(await refuser({ reference, auteurId: null, maintenant })).toEqual({
      success: true,
      data: undefined,
    })
  })

  it('refuse même quand le coordinateur à prévenir est introuvable', async () => {
    const refuser = refuserUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationEnAttente,
        cle: 1,
      }),
      enregistrerLeRefus: async () => undefined,
      lireLeCoordinateur: async () => null,
      prevenirLeCoordinateur: async () => undefined,
    })

    expect(await refuser({ reference, auteurId: null, maintenant })).toEqual({
      success: true,
      data: undefined,
    })
  })

  it('échoue sur une invitation introuvable', async () => {
    const refuser = refuserUneInvitation({
      lireUneInvitation: async () => null,
      enregistrerLeRefus: async () => undefined,
      lireLeCoordinateur: async () => coordinateur,
      prevenirLeCoordinateur: async () => undefined,
    })

    expect(await refuser({ reference, auteurId: null, maintenant })).toEqual({
      success: false,
      error: { _tag: 'InvitationIntrouvable' },
    })
  })

  it('échoue sur une invitation déjà refusée', async () => {
    const refuser = refuserUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationRefusee,
        cle: 1,
      }),
      enregistrerLeRefus: async () => undefined,
      lireLeCoordinateur: async () => coordinateur,
      prevenirLeCoordinateur: async () => undefined,
    })

    expect(await refuser({ reference, auteurId: null, maintenant })).toEqual({
      success: false,
      error: { _tag: 'InvitationDejaTraitee', reference, statut: 'Refusee' },
    })
  })
})

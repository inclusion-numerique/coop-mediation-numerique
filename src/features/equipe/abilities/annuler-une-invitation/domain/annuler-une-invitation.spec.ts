import { describe, expect, it } from 'vitest'
import {
  CoordinateurId,
  Courriel,
  type Gestionnaire,
  MediateurId,
  ReferenceInvitation,
  UtilisateurId,
} from '../../../domain'
import type {
  InvitationAcceptee,
  InvitationEnAttente,
} from '../../../domain/invitation/invitation'
import { annulerUneInvitation } from './annuler-une-invitation'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const reference = ReferenceInvitation({
  email: Courriel('invite@example.com'),
  coordinateurId,
})

const invitationEnAttente: InvitationEnAttente = {
  reference,
  invite: { type: 'SansCompte' },
  envoyeeLe: new Date('2026-01-01T09:00:00Z'),
  renvoyeeLe: null,
  statut: 'EnAttente',
}

const invitationAcceptee: InvitationAcceptee = {
  ...invitationEnAttente,
  invite: {
    type: 'MediateurInscrit',
    mediateurId: MediateurId('550e8400-e29b-41d4-a716-446655440011'),
  },
  statut: 'Acceptee',
  accepteeLe: new Date('2026-01-06T09:00:00Z'),
}

const coordinateur: Gestionnaire = { type: 'Coordinateur', coordinateurId }

const auteurId = UtilisateurId('550e8400-e29b-41d4-a716-446655440041')

describe('annuler une invitation', () => {
  it('supprime une invitation en attente de son équipe', async () => {
    const annuler = annulerUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationEnAttente,
        cle: 1,
      }),
      supprimerLInvitation: async () => undefined,
    })

    expect(
      await annuler({ reference, gestionnaire: coordinateur, auteurId }),
    ).toEqual({ success: true, data: { reference, auteurId } })
  })

  it('est refusé à qui ne gère pas l’équipe', async () => {
    const annuler = annulerUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationEnAttente,
        cle: 1,
      }),
      supprimerLInvitation: async () => undefined,
    })

    expect(
      await annuler({ reference, gestionnaire: { type: 'Autre' }, auteurId }),
    ).toEqual({ success: false, error: { _tag: 'ActionNonAutorisee' } })
  })

  it('échoue sur une invitation introuvable', async () => {
    const annuler = annulerUneInvitation({
      lireUneInvitation: async () => null,
      supprimerLInvitation: async () => undefined,
    })

    expect(
      await annuler({ reference, gestionnaire: coordinateur, auteurId }),
    ).toEqual({ success: false, error: { _tag: 'InvitationIntrouvable' } })
  })

  it('échoue sur une invitation déjà acceptée', async () => {
    const annuler = annulerUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationAcceptee,
        cle: 1,
      }),
      supprimerLInvitation: async () => undefined,
    })

    expect(
      await annuler({ reference, gestionnaire: coordinateur, auteurId }),
    ).toEqual({
      success: false,
      error: { _tag: 'InvitationDejaTraitee', reference, statut: 'Acceptee' },
    })
  })
})

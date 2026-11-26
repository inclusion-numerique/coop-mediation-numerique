import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import {
  type CoordinateurDeLEquipe,
  CoordinateurId,
  Courriel,
  EnvoiEchoue,
  type Gestionnaire,
  NomAffiche,
  ReferenceInvitation,
  UtilisateurId,
} from '../../../domain'
import type {
  InvitationEnAttente,
  InvitationRefusee,
} from '../../../domain/invitation/invitation'
import { relancerUneInvitation } from './relancer-une-invitation'

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

const gestionnaire: Gestionnaire = { type: 'Coordinateur', coordinateurId }

const auteurId = UtilisateurId('550e8400-e29b-41d4-a716-446655440041')

const maintenant = new Date('2026-01-10T09:00:00Z')

describe('relancer une invitation', () => {
  it('renvoie une invitation en attente depuis plus d’une heure', async () => {
    const relancer = relancerUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationEnAttente,
        cle: 1,
      }),
      lireLeCoordinateur: async () => coordinateur,
      envoyerUneInvitation: async () => success(undefined),
      enregistrerLaRelance: async () => undefined,
    })

    expect(
      await relancer({ reference, gestionnaire, auteurId, maintenant }),
    ).toEqual({ success: true, data: undefined })
  })

  it('est refusée à qui ne gère pas l’équipe', async () => {
    const relancer = relancerUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationEnAttente,
        cle: 1,
      }),
      lireLeCoordinateur: async () => coordinateur,
      envoyerUneInvitation: async () => success(undefined),
      enregistrerLaRelance: async () => undefined,
    })

    expect(
      await relancer({
        reference,
        gestionnaire: { type: 'Autre' },
        auteurId,
        maintenant,
      }),
    ).toEqual({ success: false, error: { _tag: 'ActionNonAutorisee' } })
  })

  it('échoue sur une invitation introuvable', async () => {
    const relancer = relancerUneInvitation({
      lireUneInvitation: async () => null,
      lireLeCoordinateur: async () => coordinateur,
      envoyerUneInvitation: async () => success(undefined),
      enregistrerLaRelance: async () => undefined,
    })

    expect(
      await relancer({ reference, gestionnaire, auteurId, maintenant }),
    ).toEqual({ success: false, error: { _tag: 'InvitationIntrouvable' } })
  })

  it('échoue sur une invitation déjà refusée', async () => {
    const relancer = relancerUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationRefusee,
        cle: 1,
      }),
      lireLeCoordinateur: async () => coordinateur,
      envoyerUneInvitation: async () => success(undefined),
      enregistrerLaRelance: async () => undefined,
    })

    expect(
      await relancer({ reference, gestionnaire, auteurId, maintenant }),
    ).toEqual({
      success: false,
      error: { _tag: 'InvitationDejaTraitee', reference, statut: 'Refusee' },
    })
  })

  it('attend une heure entre deux envois', async () => {
    const relancer = relancerUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationEnAttente,
        cle: 1,
      }),
      lireLeCoordinateur: async () => coordinateur,
      envoyerUneInvitation: async () => success(undefined),
      enregistrerLaRelance: async () => undefined,
    })

    expect(
      await relancer({
        reference,
        gestionnaire,
        auteurId,
        maintenant: new Date('2026-01-01T09:30:00Z'),
      }),
    ).toEqual({ success: false, error: { _tag: 'RelanceTropRecente' } })
  })

  it('échoue quand le coordinateur de l’équipe est introuvable', async () => {
    const relancer = relancerUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationEnAttente,
        cle: 1,
      }),
      lireLeCoordinateur: async () => null,
      envoyerUneInvitation: async () => success(undefined),
      enregistrerLaRelance: async () => undefined,
    })

    expect(
      await relancer({ reference, gestionnaire, auteurId, maintenant }),
    ).toEqual({ success: false, error: { _tag: 'CoordinateurIntrouvable' } })
  })

  it('échoue quand l’envoi du courriel échoue', async () => {
    const relancer = relancerUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationEnAttente,
        cle: 1,
      }),
      lireLeCoordinateur: async () => coordinateur,
      envoyerUneInvitation: async () => failure(EnvoiEchoue()),
      enregistrerLaRelance: async () => undefined,
    })

    expect(
      await relancer({ reference, gestionnaire, auteurId, maintenant }),
    ).toEqual({ success: false, error: { _tag: 'EnvoiEchoue' } })
  })
})

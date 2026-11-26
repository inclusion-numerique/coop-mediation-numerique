import { describe, expect, it } from 'vitest'
import {
  type CoordinateurDeLEquipe,
  CoordinateurId,
  Courriel,
  MediateurId,
  NomAffiche,
  ReferenceInvitation,
  UtilisateurId,
} from '../../../domain'
import type {
  InvitationAcceptee,
  InvitationEnAttente,
} from '../../../domain/invitation/invitation'
import type { Accepteur } from './accepter'
import { accepterUneInvitation } from './accepter-une-invitation'

const email = Courriel('invite@example.com')

const reference = ReferenceInvitation({
  email,
  coordinateurId: CoordinateurId('550e8400-e29b-41d4-a716-446655440001'),
})

const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440031')

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
  statut: 'Acceptee',
  accepteeLe: new Date('2026-01-06T09:00:00Z'),
}

const coordinateur: CoordinateurDeLEquipe = {
  nom: NomAffiche('Camille Martin'),
  email: Courriel('camille.martin@example.com'),
  telephone: null,
}

const invite: Accepteur = { type: 'InscriptionValidee', email, mediateurId }

const auteurId = UtilisateurId('550e8400-e29b-41d4-a716-446655440041')

const maintenant = new Date('2026-01-10T09:00:00Z')

describe('accepter une invitation', () => {
  it('accepte une invitation en attente adressée à la personne', async () => {
    const accepterLInvitation = accepterUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationEnAttente,
        cle: 1,
      }),
      enregistrerLAcceptation: async () => undefined,
      lireLeCoordinateur: async () => coordinateur,
      prevenirLeCoordinateur: async () => undefined,
    })

    expect(
      await accepterLInvitation({
        reference,
        accepteur: invite,
        auteurId,
        maintenant,
      }),
    ).toEqual({ success: true, data: undefined })
  })

  it('accepte même quand le coordinateur à prévenir est introuvable', async () => {
    const accepterLInvitation = accepterUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationEnAttente,
        cle: 1,
      }),
      enregistrerLAcceptation: async () => undefined,
      lireLeCoordinateur: async () => null,
      prevenirLeCoordinateur: async () => undefined,
    })

    expect(
      await accepterLInvitation({
        reference,
        accepteur: invite,
        auteurId,
        maintenant,
      }),
    ).toEqual({ success: true, data: undefined })
  })

  it('échoue sur une invitation introuvable', async () => {
    const accepterLInvitation = accepterUneInvitation({
      lireUneInvitation: async () => null,
      enregistrerLAcceptation: async () => undefined,
      lireLeCoordinateur: async () => coordinateur,
      prevenirLeCoordinateur: async () => undefined,
    })

    expect(
      await accepterLInvitation({
        reference,
        accepteur: invite,
        auteurId,
        maintenant,
      }),
    ).toEqual({ success: false, error: { _tag: 'InvitationIntrouvable' } })
  })

  it.each<{ cas: string; accepteur: Accepteur; erreur: string }>([
    {
      cas: 'est réservée à la personne invitée',
      accepteur: {
        type: 'InscriptionValidee',
        email: Courriel('quelqu-un-d-autre@example.com'),
        mediateurId,
      },
      erreur: 'MauvaisDestinataire',
    },
    {
      cas: 'attend la fin de l’inscription',
      accepteur: { type: 'InscriptionEnCours', email },
      erreur: 'InscriptionNonValidee',
    },
  ])('$cas', async ({ accepteur, erreur }) => {
    const accepterLInvitation = accepterUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationEnAttente,
        cle: 1,
      }),
      enregistrerLAcceptation: async () => undefined,
      lireLeCoordinateur: async () => coordinateur,
      prevenirLeCoordinateur: async () => undefined,
    })

    expect(
      await accepterLInvitation({ reference, accepteur, auteurId, maintenant }),
    ).toEqual({ success: false, error: { _tag: erreur } })
  })

  it('ne se fait qu’une fois', async () => {
    const accepterLInvitation = accepterUneInvitation({
      lireUneInvitation: async () => ({
        invitation: invitationAcceptee,
        cle: 1,
      }),
      enregistrerLAcceptation: async () => undefined,
      lireLeCoordinateur: async () => coordinateur,
      prevenirLeCoordinateur: async () => undefined,
    })

    expect(
      await accepterLInvitation({
        reference,
        accepteur: invite,
        auteurId,
        maintenant,
      }),
    ).toEqual({
      success: false,
      error: { _tag: 'InvitationDejaTraitee', reference, statut: 'Acceptee' },
    })
  })
})

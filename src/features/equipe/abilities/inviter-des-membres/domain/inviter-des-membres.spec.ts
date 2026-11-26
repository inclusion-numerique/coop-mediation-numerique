import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import {
  type CoordinateurDeLEquipe,
  CoordinateurId,
  Courriel,
  EnvoiEchoue,
  type Invitation,
  MediateurId,
  NomAffiche,
  ReferenceInvitation,
  UtilisateurId,
} from '../../../domain'
import type { InvitationEnAttente } from '../../../domain/invitation/invitation'
import { type Inviteur, inviterDesMembres } from './inviter-des-membres'
import type { Existant } from './planifier'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const inviteur: Inviteur = { type: 'Coordinateur', coordinateurId }

const coordinateur: CoordinateurDeLEquipe = {
  nom: NomAffiche('Camille Martin'),
  email: Courriel('camille.martin@example.com'),
  telephone: null,
}

const auteurId = UtilisateurId('550e8400-e29b-41d4-a716-446655440041')

const maintenant = new Date('2026-10-14T09:00:00Z')

const nouveau = Courriel('nouveau@example.com')

const membre = Courriel('membre@example.com')

const invite = Courriel('invite@example.com')

const invitationEnAttente: InvitationEnAttente = {
  reference: ReferenceInvitation({ email: invite, coordinateurId }),
  invite: { type: 'SansCompte' },
  envoyeeLe: new Date('2026-01-01T09:00:00Z'),
  renvoyeeLe: null,
  statut: 'EnAttente',
}

const personne = {
  invitations: [],
  membresActifs: new Set<Courriel>(),
  mediateursConnus: new Map<Courriel, MediateurId>(),
}

describe('inviter des membres', () => {
  it('invite chaque adresse une seule fois, même saisie deux fois', async () => {
    const inviter = inviterDesMembres({
      lireLeCoordinateur: async () => coordinateur,
      lireLExistant: async () => ({ existant: personne, cles: 1 }),
      enregistrerLesInvitations: async () => undefined,
      envoyerUneInvitation: async () => success(undefined),
    })

    expect(
      await inviter({
        inviteur,
        candidats: [nouveau, Courriel('NOUVEAU@example.com')],
        auteurId,
        maintenant,
      }),
    ).toEqual({
      success: true,
      data: { envoyees: [nouveau], ecartees: [], echecs: [] },
    })
  })

  it('écarte un membre actif de l’équipe et invite les autres', async () => {
    const inviter = inviterDesMembres({
      lireLeCoordinateur: async () => coordinateur,
      lireLExistant: async () => ({
        existant: { ...personne, membresActifs: new Set([membre]) },
        cles: 1,
      }),
      enregistrerLesInvitations: async () => undefined,
      envoyerUneInvitation: async () => success(undefined),
    })

    expect(
      await inviter({
        inviteur,
        candidats: [membre, nouveau],
        auteurId,
        maintenant,
      }),
    ).toEqual({
      success: true,
      data: {
        envoyees: [nouveau],
        ecartees: [{ email: membre, raison: 'DejaMembre' }],
        echecs: [],
      },
    })
  })

  it('n’envoie rien quand chaque personne attend déjà son invitation', async () => {
    const inviter = inviterDesMembres({
      lireLeCoordinateur: async () => coordinateur,
      lireLExistant: async () => ({
        existant: { ...personne, invitations: [invitationEnAttente] },
        cles: 1,
      }),
      enregistrerLesInvitations: async () => undefined,
      envoyerUneInvitation: async () => success(undefined),
    })

    expect(
      await inviter({ inviteur, candidats: [invite], auteurId, maintenant }),
    ).toEqual({
      success: false,
      error: {
        _tag: 'AucuneInvitationAEnvoyer',
        ecartes: [{ email: invite, raison: 'DejaInvitee' }],
      },
    })
  })

  it.each<{ cas: string; invitation: Invitation }>([
    {
      cas: 'qui l’a refusée',
      invitation: {
        ...invitationEnAttente,
        statut: 'Refusee',
        refuseeLe: new Date('2026-01-03T09:00:00Z'),
      },
    },
    {
      cas: 'qui l’avait acceptée puis a quitté l’équipe',
      invitation: {
        ...invitationEnAttente,
        invite: {
          type: 'MediateurInscrit',
          mediateurId: MediateurId('550e8400-e29b-41d4-a716-446655440011'),
        },
        statut: 'Acceptee',
        accepteeLe: new Date('2026-01-06T09:00:00Z'),
      },
    },
  ])('invite de nouveau une personne $cas', async ({ invitation }) => {
    const existant: Existant = { ...personne, invitations: [invitation] }
    const inviter = inviterDesMembres({
      lireLeCoordinateur: async () => coordinateur,
      lireLExistant: async () => ({ existant, cles: 1 }),
      enregistrerLesInvitations: async () => undefined,
      envoyerUneInvitation: async () => success(undefined),
    })

    expect(
      await inviter({ inviteur, candidats: [invite], auteurId, maintenant }),
    ).toEqual({
      success: true,
      data: { envoyees: [invite], ecartees: [], echecs: [] },
    })
  })

  it('distingue les invitations dont l’envoi a échoué', async () => {
    const inviter = inviterDesMembres({
      lireLeCoordinateur: async () => coordinateur,
      lireLExistant: async () => ({ existant: personne, cles: 1 }),
      enregistrerLesInvitations: async () => undefined,
      envoyerUneInvitation: async () => failure(EnvoiEchoue()),
    })

    expect(
      await inviter({ inviteur, candidats: [nouveau], auteurId, maintenant }),
    ).toEqual({
      success: true,
      data: { envoyees: [], ecartees: [], echecs: [nouveau] },
    })
  })

  it('est réservé à un coordinateur', async () => {
    const inviter = inviterDesMembres({
      lireLeCoordinateur: async () => coordinateur,
      lireLExistant: async () => ({ existant: personne, cles: 1 }),
      enregistrerLesInvitations: async () => undefined,
      envoyerUneInvitation: async () => success(undefined),
    })

    expect(
      await inviter({
        inviteur: { type: 'NonCoordinateur' },
        candidats: [nouveau],
        auteurId,
        maintenant,
      }),
    ).toEqual({ success: false, error: { _tag: 'ActionNonAutorisee' } })
  })

  it('échoue quand le coordinateur de l’équipe est introuvable', async () => {
    const inviter = inviterDesMembres({
      lireLeCoordinateur: async () => null,
      lireLExistant: async () => ({ existant: personne, cles: 1 }),
      enregistrerLesInvitations: async () => undefined,
      envoyerUneInvitation: async () => success(undefined),
    })

    expect(
      await inviter({ inviteur, candidats: [nouveau], auteurId, maintenant }),
    ).toEqual({ success: false, error: { _tag: 'CoordinateurIntrouvable' } })
  })
})

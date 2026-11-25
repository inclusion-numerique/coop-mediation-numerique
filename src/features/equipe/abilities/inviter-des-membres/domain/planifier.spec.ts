import { describe, expect, it } from 'vitest'
import { Courriel, MediateurId } from '../../../domain'
import { CoordinateurId } from '../../../domain/identifiants/coordinateur-id'
import {
  type InvitationAcceptee,
  type InvitationEnAttente,
  type InvitationRefusee,
} from '../../../domain/invitation/invitation'
import { ReferenceInvitation } from '../../../domain/invitation/reference-invitation'
import { planifier } from './planifier'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440011')

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
  invite: { type: 'MediateurInscrit', mediateurId },
  renvoyeeLe: new Date('2026-01-05T09:00:00Z'),
  statut: 'Acceptee',
  accepteeLe: new Date('2026-01-06T09:00:00Z'),
}

const invitationRefusee: InvitationRefusee = {
  ...invitationEnAttente,
  statut: 'Refusee',
  refuseeLe: new Date('2026-01-03T09:00:00Z'),
}

const maintenant = new Date('2026-10-14T09:00:00Z')
const nouveau = Courriel('nouveau@example.com')
const inscrit = Courriel('inscrit@example.com')
const membre = Courriel('membre@example.com')
const mediateurInscrit = MediateurId('550e8400-e29b-41d4-a716-446655440041')

const existant = {
  invitations: [],
  membresActifs: new Set<Courriel>(),
  mediateursConnus: new Map<Courriel, MediateurId>(),
}

const emailsPlanifies = (resultat: ReturnType<typeof planifier>) =>
  resultat.success ? resultat.data.aEnvoyer.map((i) => i.reference.email) : []

describe('planifier des invitations', () => {
  it('invite chaque adresse une seule fois, même saisie deux fois', () => {
    const resultat = planifier({
      coordinateurId,
      candidats: [nouveau, Courriel('NOUVEAU@example.com')],
      existant,
      maintenant,
    })

    expect(emailsPlanifies(resultat)).toEqual([nouveau])
  })

  it('reconnaît un médiateur inscrit d’après son email, côté serveur', () => {
    const resultat = planifier({
      coordinateurId,
      candidats: [inscrit],
      existant: {
        ...existant,
        mediateursConnus: new Map([[inscrit, mediateurInscrit]]),
      },
      maintenant,
    })

    expect(resultat.success && resultat.data.aEnvoyer[0]?.invite).toEqual({
      type: 'MediateurInscrit',
      mediateurId: mediateurInscrit,
    })
  })

  it('écarte un membre actif de l’équipe', () => {
    const resultat = planifier({
      coordinateurId,
      candidats: [membre, nouveau],
      existant: { ...existant, membresActifs: new Set([membre]) },
      maintenant,
    })

    expect(resultat.success && resultat.data.ecartes).toEqual([
      { email: membre, raison: 'DejaMembre' },
    ])
  })

  it('écarte une personne dont l’invitation attend encore sa réponse', () => {
    const resultat = planifier({
      coordinateurId,
      candidats: [invitationEnAttente.reference.email],
      existant: { ...existant, invitations: [invitationEnAttente] },
      maintenant,
    })

    expect(resultat).toEqual({
      success: false,
      error: {
        _tag: 'AucuneInvitationAEnvoyer',
        ecartes: [
          { email: invitationEnAttente.reference.email, raison: 'DejaInvitee' },
        ],
      },
    })
  })

  it.each([
    ['qui l’a refusée', invitationRefusee],
    ['qui l’avait acceptée puis a quitté l’équipe', invitationAcceptee],
  ])('invite de nouveau une personne %s', (_, invitation) => {
    const resultat = planifier({
      coordinateurId,
      candidats: [invitation.reference.email],
      existant: { ...existant, invitations: [invitation] },
      maintenant,
    })

    expect(resultat.success && resultat.data.aEnvoyer[0]).toEqual(
      expect.objectContaining({
        statut: 'EnAttente',
        envoyeeLe: maintenant,
        renvoyeeLe: null,
      }),
    )
  })
})

import { describe, expect, it } from 'vitest'
import {
  CoordinateurId,
  Courriel,
  MediateurId,
  ReferenceInvitation,
  UtilisateurId,
} from '../../../domain'
import type {
  InvitationAcceptee,
  InvitationEnAttente,
  InvitationRefusee,
} from '../../../domain/invitation/invitation'
import { accepterLesInvitationsEnAttente } from './accepter-les-invitations-en-attente'

const utilisateurId = UtilisateurId('550e8400-e29b-41d4-a716-446655440041')

const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440011')

const email = Courriel('invite@example.com')

const maintenant = new Date('2026-11-26T09:00:00Z')

const equipeQuiAttend = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const equipeRefusee = CoordinateurId('550e8400-e29b-41d4-a716-446655440002')

const equipeDejaRejointe = CoordinateurId(
  '550e8400-e29b-41d4-a716-446655440003',
)

const enAttente: InvitationEnAttente = {
  reference: ReferenceInvitation({ email, coordinateurId: equipeQuiAttend }),
  invite: { type: 'SansCompte' },
  envoyeeLe: new Date('2026-11-01T09:00:00Z'),
  renvoyeeLe: null,
  statut: 'EnAttente',
}

const refusee: InvitationRefusee = {
  ...enAttente,
  reference: ReferenceInvitation({ email, coordinateurId: equipeRefusee }),
  statut: 'Refusee',
  refuseeLe: new Date('2026-11-02T09:00:00Z'),
}

const acceptee: InvitationAcceptee = {
  ...enAttente,
  reference: ReferenceInvitation({ email, coordinateurId: equipeDejaRejointe }),
  statut: 'Acceptee',
  accepteeLe: new Date('2026-11-03T09:00:00Z'),
}

describe('accepter les invitations en attente d’un médiateur qui s’inscrit', () => {
  it('accepte les invitations en attente et rejoint les équipes qui ne sont pas refusées', async () => {
    const accepter = accepterLesInvitationsEnAttente({
      lireLeMediateurInvite: async () => ({ mediateurId, email }),
      lireLesInvitationsDe: async () => [enAttente, refusee, acceptee],
      enregistrerLesAcceptations: async () => undefined,
    })

    expect(await accepter({ utilisateurId, maintenant })).toEqual({
      success: true,
      data: {
        type: 'Acceptees',
        mediateurId,
        acceptees: [enAttente.reference],
        accepteesLe: maintenant,
        equipes: [equipeQuiAttend, equipeDejaRejointe],
      },
    })
  })

  it('n’accepte rien pour qui n’a pas de compte médiateur', async () => {
    const accepter = accepterLesInvitationsEnAttente({
      lireLeMediateurInvite: async () => null,
      lireLesInvitationsDe: async () => [enAttente],
      enregistrerLesAcceptations: async () => undefined,
    })

    expect(await accepter({ utilisateurId, maintenant })).toEqual({
      success: true,
      data: { type: 'SansCompteMediateur' },
    })
  })
})

import { describe, expect, it } from 'vitest'
import { Courriel, MediateurId } from '../../../domain'
import { CoordinateurId } from '../../../domain/identifiants/coordinateur-id'
import { ReferenceInvitation } from '../../../domain/invitation/reference-invitation'
import { planifier } from './planifier'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const maintenant = new Date('2026-10-14T09:00:00Z')

const inscrit = Courriel('inscrit@example.com')

const mediateurInscrit = MediateurId('550e8400-e29b-41d4-a716-446655440041')

describe('planifier des invitations', () => {
  it('reconnaît un médiateur inscrit d’après son email, côté serveur', () => {
    expect(
      planifier({
        coordinateurId,
        candidats: [inscrit],
        existant: {
          invitations: [],
          membresActifs: new Set<Courriel>(),
          mediateursConnus: new Map([[inscrit, mediateurInscrit]]),
        },
        maintenant,
      }),
    ).toEqual({
      success: true,
      data: {
        aEnvoyer: [
          {
            reference: ReferenceInvitation({ email: inscrit, coordinateurId }),
            invite: { type: 'MediateurInscrit', mediateurId: mediateurInscrit },
            envoyeeLe: maintenant,
            renvoyeeLe: null,
            statut: 'EnAttente',
          },
        ],
        ecartes: [],
      },
    })
  })
})

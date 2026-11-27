import { describe, expect, it } from 'vitest'
import {
  AdhesionId,
  CoordinateurId,
  type Gestionnaire,
  MediateurId,
  UtilisateurId,
} from '../../../domain'
import type { AdhesionActive } from '../../../domain/adhesion'
import { retirerUnMembre } from './retirer-un-membre'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440011')

const adhesionActive: AdhesionActive = {
  id: AdhesionId('550e8400-e29b-41d4-a716-446655440021'),
  mediateurId,
  coordinateurId,
  depuis: new Date('2026-02-01T09:00:00Z'),
  statut: 'Active',
}

const gestionnaire: Gestionnaire = { type: 'Coordinateur', coordinateurId }

const auteurId = UtilisateurId('550e8400-e29b-41d4-a716-446655440041')

const maintenant = new Date('2026-03-01T09:00:00Z')

describe('retirer un membre', () => {
  it('archive l’adhésion active du membre', async () => {
    const retirer = retirerUnMembre({
      lireLesAdhesionsDeLaPaire: async () => [adhesionActive],
      archiverLAdhesion: async () => undefined,
    })

    expect(
      await retirer({
        mediateurId,
        coordinateurId,
        gestionnaire,
        auteurId,
        maintenant,
      }),
    ).toEqual({
      success: true,
      data: {
        adhesion: {
          ...adhesionActive,
          statut: 'Archivee',
          archiveeLe: maintenant,
        },
        auteurId,
      },
    })
  })

  it('est refusé à qui ne gère pas l’équipe', async () => {
    const retirer = retirerUnMembre({
      lireLesAdhesionsDeLaPaire: async () => [adhesionActive],
      archiverLAdhesion: async () => undefined,
    })

    expect(
      await retirer({
        mediateurId,
        coordinateurId,
        gestionnaire: { type: 'Autre' },
        auteurId,
        maintenant,
      }),
    ).toEqual({ success: false, error: { _tag: 'ActionNonAutorisee' } })
  })

  it('échoue pour qui ne fait pas partie de l’équipe', async () => {
    const retirer = retirerUnMembre({
      lireLesAdhesionsDeLaPaire: async () => [],
      archiverLAdhesion: async () => undefined,
    })

    expect(
      await retirer({
        mediateurId,
        coordinateurId,
        gestionnaire,
        auteurId,
        maintenant,
      }),
    ).toEqual({ success: false, error: { _tag: 'PasMembre' } })
  })
})

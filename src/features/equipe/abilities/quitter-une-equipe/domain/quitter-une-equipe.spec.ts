import { describe, expect, it } from 'vitest'
import {
  AdhesionId,
  CoordinateurId,
  MediateurId,
  UtilisateurId,
} from '../../../domain'
import type { AdhesionActive, AdhesionArchivee } from '../../../domain/adhesion'
import { quitterUneEquipe } from './quitter-une-equipe'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440011')

const auteurId = UtilisateurId('550e8400-e29b-41d4-a716-446655440041')

const maintenant = new Date('2026-11-26T09:00:00Z')

const adhesionActive: AdhesionActive = {
  id: AdhesionId('550e8400-e29b-41d4-a716-446655440021'),
  mediateurId,
  coordinateurId,
  depuis: new Date('2026-02-01T09:00:00Z'),
  statut: 'Active',
}

const adhesionArchivee: AdhesionArchivee = {
  id: AdhesionId('550e8400-e29b-41d4-a716-446655440022'),
  mediateurId,
  coordinateurId,
  depuis: new Date('2025-02-01T09:00:00Z'),
  statut: 'Archivee',
  archiveeLe: new Date('2025-06-01T09:00:00Z'),
}

describe('quitter une équipe', () => {
  it('archive l’adhésion active du médiateur qui part', async () => {
    const quitter = quitterUneEquipe({
      lireLesAdhesionsDeLaPaire: async () => [adhesionArchivee, adhesionActive],
      enregistrerLeDepart: async () => undefined,
    })

    expect(
      await quitter({ mediateurId, coordinateurId, auteurId, maintenant }),
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

  it('est refusé à qui a déjà quitté l’équipe', async () => {
    const quitter = quitterUneEquipe({
      lireLesAdhesionsDeLaPaire: async () => [adhesionArchivee],
      enregistrerLeDepart: async () => undefined,
    })

    expect(
      await quitter({ mediateurId, coordinateurId, auteurId, maintenant }),
    ).toEqual({ success: false, error: { _tag: 'PasMembre' } })
  })
})

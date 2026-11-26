import { Search, Sort } from '@arckit/resultset'
import { describe, expect, it } from 'vitest'
import { CoordinateurId, type CriteresEquipe } from '../../../domain'
import { exporterLesMembres } from './exporter-les-membres'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const criteres: CriteresEquipe = {
  recherche: Search('martin'),
  statuts: [],
  role: null,
  tri: Sort('membre', 'asc'),
}

const maintenant = new Date('2026-10-14T09:00:00Z')

describe('exporter les membres d’une équipe', () => {
  it('exporte les membres pour un gestionnaire de l’équipe', async () => {
    const exporter = exporterLesMembres({
      lireLesMembresAExporter: async () => [],
    })

    expect(
      await exporter({
        coordinateurId,
        lecteur: {
          gestionnaire: { type: 'Administrateur' },
          membreActifDeLEquipe: false,
        },
        criteres,
        maintenant,
      }),
    ).toEqual({ success: true, data: [] })
  })

  it('est refusé à qui n’est ni membre actif ni gestionnaire de l’équipe', async () => {
    const exporter = exporterLesMembres({
      lireLesMembresAExporter: async () => [],
    })

    expect(
      await exporter({
        coordinateurId,
        lecteur: {
          gestionnaire: { type: 'Autre' },
          membreActifDeLEquipe: false,
        },
        criteres,
        maintenant,
      }),
    ).toEqual({ success: false, error: { _tag: 'ConsultationNonAutorisee' } })
  })
})

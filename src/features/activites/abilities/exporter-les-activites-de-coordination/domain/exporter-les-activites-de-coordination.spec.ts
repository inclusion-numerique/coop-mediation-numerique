import { describe, expect, it } from 'vitest'
import { success } from '@/libraries/result'
import {
  CoordinateurId,
  type CriteresDesCoordinations,
  NomDeTag,
  TagId,
} from '../../../domain'
import { exporterLesActivitesDeCoordination } from './exporter-les-activites-de-coordination'

const coordinateurId = CoordinateurId('c0000000-0000-4000-8000-000000000001')

const reseau = {
  id: TagId('f0000000-0000-4000-8000-000000000001'),
  nom: NomDeTag('Réseau'),
}

const sansFiltre: CriteresDesCoordinations = {
  periode: null,
  types: [],
  tags: [],
}

const exporter = exporterLesActivitesDeCoordination({
  activitesAExporter: async () => [],
  tagsUtilisables: async () => [reseau],
})

describe('exporter les activités de coordination', () => {
  it('ne rappelle aucun tag quand aucun tag ne filtre l’export', async () => {
    expect(await exporter({ coordinateurId, criteres: sansFiltre })).toEqual(
      success({ activites: [], tags: [] }),
    )
  })

  it('rappelle les tags utilisables qui filtrent l’export', async () => {
    expect(
      await exporter({
        coordinateurId,
        criteres: { ...sansFiltre, tags: [reseau.id] },
      }),
    ).toEqual(success({ activites: [], tags: [reseau] }))
  })
})

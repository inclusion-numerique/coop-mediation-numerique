import { describe, expect, it } from 'vitest'
import { type CriteresDesCoordinations, NomDeTag, TagId } from '../../../domain'
import { tagsRappeles } from './tags-rappeles'

const reseau = {
  id: TagId('f0000000-0000-4000-8000-000000000001'),
  nom: NomDeTag('Réseau'),
}

const sansFiltre: CriteresDesCoordinations = {
  periode: null,
  types: [],
  tags: [],
}

describe('tags rappelés dans l’export des activités de coordination', () => {
  it('ne rappelle aucun tag quand aucun tag ne filtre l’export', async () => {
    expect(
      await tagsRappeles({
        criteres: sansFiltre,
        tagsUtilisables: async () => [reseau],
      }),
    ).toEqual([])
  })

  it('rappelle les tags utilisables qui filtrent l’export', async () => {
    expect(
      await tagsRappeles({
        criteres: { ...sansFiltre, tags: [reseau.id] },
        tagsUtilisables: async () => [reseau],
      }),
    ).toEqual([reseau])
  })
})

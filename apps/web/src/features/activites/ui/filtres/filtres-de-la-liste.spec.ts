import { criteresDesActivites } from '../../domain'
import { filtresDeLaListe } from './filtres-de-la-liste'

describe('filtres de la liste', () => {
  it('reprend les critères dans le vocabulaire de l’URL', () => {
    expect(
      filtresDeLaListe(
        criteresDesActivites({
          du: '2026-01-01',
          au: '2026-01-31',
          types: 'collectif',
          rdvs: 'past',
          thematiqueNonAdministratives: 'Email',
          rdv: '1',
          source: 'v1',
        }),
      ),
    ).toMatchObject({
      du: '2026-01-01',
      au: '2026-01-31',
      types: ['collectif'],
      rdvs: ['past'],
      thematiqueNonAdministratives: ['Email'],
      rdv: '1',
      source: 'v1',
    })
  })

  it('laisse vide ce qui n’est pas filtré', () => {
    expect(filtresDeLaListe(criteresDesActivites({}))).toEqual(
      expect.objectContaining({ types: undefined, lieux: undefined }),
    )
  })
})

import { describe, expect, it } from 'vitest'
import { cheminAvecRequete } from './requete-de-l-export.search-params'

describe('requête de l’export', () => {
  it('n’ajoute pas de requête sans filtre', () => {
    expect(cheminAvecRequete('/coop/mes-activites/export', '')).toBe(
      '/coop/mes-activites/export',
    )
  })

  it('ajoute la requête au chemin', () => {
    expect(
      cheminAvecRequete('/coop/mes-activites/export', 'types=collectif'),
    ).toBe('/coop/mes-activites/export?types=collectif')
  })
})

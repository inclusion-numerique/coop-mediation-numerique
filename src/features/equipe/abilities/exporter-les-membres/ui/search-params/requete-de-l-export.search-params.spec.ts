import { describe, expect, it } from 'vitest'
import { lienDExport } from './requete-de-l-export.search-params'

describe("lien d'export de l'équipe", () => {
  it('reprend la recherche, les filtres et le tri de la liste', () => {
    expect(
      lienDExport('c1', {
        recherche: 'jean',
        page: '2',
        statut: 'actifs',
        tri: 'membre',
      }),
    ).toBe(
      '/coop/mes-equipes/c1/export?recherche=jean&statut=actifs&tri=membre',
    )
  })

  it("n'ajoute pas de requête sans paramètre exporté", () => {
    expect(lienDExport('c1', { page: '2' })).toBe('/coop/mes-equipes/c1/export')
  })
})

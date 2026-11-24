import { describe, expect, it } from 'vitest'
import { lienDExport } from './requete-de-l-export.search-params'

describe("lien d'export des utilisateurs", () => {
  it('reprend les filtres et la recherche', () => {
    expect(lienDExport({ roles: 'admin' }, 'jean')).toBe(
      '/administration/utilisateurs/export?roles=admin&recherche=jean',
    )
  })

  it("n'ajoute pas de requête sans filtre ni recherche", () => {
    expect(lienDExport({}, null)).toBe('/administration/utilisateurs/export')
  })
})

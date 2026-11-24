import { describe, expect, it } from 'vitest'
import { lienDExport } from './requete-de-l-export.search-params'

describe("lien d'export des utilisateurs", () => {
  it('reprend la requête des filtres et de la recherche', () => {
    expect(lienDExport('recherche=jean&roles=admin')).toBe(
      '/administration/utilisateurs/export?recherche=jean&roles=admin',
    )
  })

  it("n'ajoute pas de requête sans filtre ni recherche", () => {
    expect(lienDExport('')).toBe('/administration/utilisateurs/export')
  })
})

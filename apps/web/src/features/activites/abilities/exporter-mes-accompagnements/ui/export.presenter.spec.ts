import { cheminAvecRequete, requeteDeLExport } from './export.presenter'

describe('requête de l’export', () => {
  it('reprend les clés d’URL des filtres, listes jointes par des virgules', () => {
    expect(
      requeteDeLExport({
        du: '2025-01-01',
        au: '2025-06-30',
        types: ['individuel', 'collectif'],
        lieux: [],
        conseiller_numerique: '1',
      }),
    ).toBe(
      'du=2025-01-01&au=2025-06-30&types=individuel%2Ccollectif&conseiller_numerique=1',
    )
  })

  it('n’ajoute pas de requête sans filtre', () => {
    expect(
      cheminAvecRequete('/coop/mes-activites/export', requeteDeLExport({})),
    ).toBe('/coop/mes-activites/export')
  })

  it('ajoute la requête au chemin', () => {
    expect(
      cheminAvecRequete('/coop/mes-activites/export', 'types=collectif'),
    ).toBe('/coop/mes-activites/export?types=collectif')
  })
})

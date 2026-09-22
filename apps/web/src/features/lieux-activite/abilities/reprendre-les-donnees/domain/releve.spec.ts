import { lieuAReprendre } from './lieu-a-reprendre.fixture'
import { relever } from './releve'

describe('le relevé', () => {
  it('compte les lieux touchés, pas les anomalies', () => {
    const releve = relever([
      lieuAReprendre({ id: 'a', adresse: '12 rue A & B', codePostal: '99999' }),
      lieuAReprendre({ id: 'b' }),
    ])

    expect(releve.lieuxMesures).toBe(2)
    expect(releve.lieuxSains).toBe(1)
    expect(releve.lieuxEcartes).toBe(1)
    expect(releve.postes.map(({ code }) => code).sort()).toEqual([
      'code-postal-invalide',
      'voie-non-reconnue',
    ])
  })

  it('range les postes du plus lourd au plus léger', () => {
    const releve = relever([
      lieuAReprendre({ id: 'a', codePostal: '99999' }),
      lieuAReprendre({ id: 'b', codePostal: '99999' }),
      lieuAReprendre({ id: 'c', horaires: 'tous les jours' }),
    ])

    expect(releve.postes.map(({ code, lieux }) => [code, lieux])).toEqual([
      ['code-postal-invalide', 2],
      ['horaires-non-osm', 1],
    ])
  })
})

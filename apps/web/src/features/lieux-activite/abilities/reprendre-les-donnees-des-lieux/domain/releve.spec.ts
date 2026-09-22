import { lieuAReprendre } from './lieu-a-reprendre.fixture'
import { relever } from './releve'

const DESORDONNES = [
  'Utilisation sécurisée du numérique',
  'Aide aux démarches administratives',
]

describe('le relevé des listes à trier', () => {
  it('ne retient que les lieux qui ont quelque chose à trier', () => {
    const releve = relever([
      lieuAReprendre({ id: 'a', services: DESORDONNES }),
      lieuAReprendre({ id: 'b' }),
    ])

    expect(releve.lieuxMesures).toBe(2)
    expect(releve.listesATrier.lieux.map(({ lieuId }) => lieuId)).toEqual(['a'])
  })

  it('compte les lieux concernés colonne par colonne', () => {
    const releve = relever([
      lieuAReprendre({ id: 'a', services: DESORDONNES }),
      lieuAReprendre({ id: 'b', services: DESORDONNES }),
      lieuAReprendre({ id: 'c', itinerance: ['Itinérant', 'Itinérant'] }),
    ])

    expect(releve.listesATrier.colonnes).toEqual([
      { colonne: 'services', lieux: 2 },
      { colonne: 'itinerance', lieux: 1 },
    ])
  })

  it('tait les colonnes que personne n’a à trier', () => {
    expect(relever([lieuAReprendre()]).listesATrier.colonnes).toEqual([])
  })

  it('porte de quoi reconnaître le lieu dans le relevé', () => {
    expect(
      relever([lieuAReprendre({ services: DESORDONNES })]).listesATrier.lieux,
    ).toEqual([
      {
        lieuId: 'e4b5f0d4-5a1f-4a5a-9a4e-2e1c9f0b1d2c',
        nom: 'Espace numérique de Reims',
        commune: 'Reims',
        codePostal: '51100',
        publie: true,
        colonnes: ['services'],
      },
    ])
  })
})

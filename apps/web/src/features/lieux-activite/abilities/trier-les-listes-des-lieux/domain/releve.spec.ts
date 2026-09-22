import { lieuATrier } from './lieu-a-trier.fixture'
import { relever } from './releve'

const DESORDONNES = [
  'Utilisation sécurisée du numérique',
  'Aide aux démarches administratives',
]

describe('le relevé', () => {
  it('ne retient que les lieux qui ont quelque chose à trier', () => {
    const releve = relever([
      lieuATrier({ id: 'a', services: DESORDONNES }),
      lieuATrier({ id: 'b' }),
    ])

    expect(releve.lieuxMesures).toBe(2)
    expect(releve.lieux.map(({ lieuId }) => lieuId)).toEqual(['a'])
  })

  it('compte les lieux concernés colonne par colonne', () => {
    const releve = relever([
      lieuATrier({ id: 'a', services: DESORDONNES }),
      lieuATrier({ id: 'b', services: DESORDONNES }),
      lieuATrier({ id: 'c', itinerance: ['Itinérant', 'Itinérant'] }),
    ])

    expect(releve.colonnes).toEqual([
      { colonne: 'services', lieux: 2 },
      { colonne: 'itinerance', lieux: 1 },
    ])
  })

  it('tait les colonnes que personne n’a à trier', () => {
    expect(relever([lieuATrier()]).colonnes).toEqual([])
  })

  it('porte de quoi reconnaître le lieu dans le relevé', () => {
    expect(relever([lieuATrier({ services: DESORDONNES })]).lieux).toEqual([
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

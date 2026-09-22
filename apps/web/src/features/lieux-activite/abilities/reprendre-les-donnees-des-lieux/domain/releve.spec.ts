import { lieuAReprendre } from './lieu-a-reprendre.fixture'
import { comptesDesHoraires, comptesParColonne, relever } from './releve'

const DESORDONNES = [
  'Utilisation sécurisée du numérique',
  'Aide aux démarches administratives',
]

describe('le relevé', () => {
  it('ne retient que les lieux qui ont quelque chose à reprendre', () => {
    const releve = relever([
      lieuAReprendre({ id: 'a', services: DESORDONNES }),
      lieuAReprendre({ id: 'b' }),
    ])

    expect(releve.lieuxMesures).toBe(2)
    expect(releve.lieux.map(({ lieuId }) => lieuId)).toEqual(['a'])
  })

  it('retient un lieu pour ses seuls horaires', () => {
    const releve = relever([
      lieuAReprendre({
        id: 'a',
        horaires: 'We 09:00-12:00 un mercredi sur deux',
      }),
    ])

    expect(
      releve.lieux.map(({ lieuId, listesATrier }) => [lieuId, listesATrier]),
    ).toEqual([['a', []]])
  })

  it('compte les lieux concernés colonne par colonne', () => {
    const releve = relever([
      lieuAReprendre({ id: 'a', services: DESORDONNES }),
      lieuAReprendre({ id: 'b', services: DESORDONNES }),
      lieuAReprendre({ id: 'c', itinerance: ['Itinérant', 'Itinérant'] }),
    ])

    expect(comptesParColonne(releve)).toEqual([
      { colonne: 'services', lieux: 2 },
      { colonne: 'itinerance', lieux: 1 },
    ])
  })

  it('tait les colonnes que personne n’a à trier', () => {
    expect(comptesParColonne(relever([lieuAReprendre()]))).toEqual([])
  })

  it('compte les horaires à corriger et ceux à effacer', () => {
    const releve = relever([
      lieuAReprendre({
        id: 'a',
        horaires: 'We 09:00-12:00 un mercredi sur deux',
      }),
      lieuAReprendre({ id: 'b', horaires: 'Mo 09:00-12:00;Tu 09:00-12:00' }),
      lieuAReprendre({ id: 'c', horaires: '"Sur rendez-vous uniquement"' }),
      lieuAReprendre({ id: 'd', horaires: 'Mo 09:00-12:00' }),
    ])

    expect(comptesDesHoraires(releve)).toEqual({ aCorriger: 2, aEffacer: 1 })
  })

  it('porte de quoi reconnaître le lieu dans le relevé', () => {
    expect(relever([lieuAReprendre({ services: DESORDONNES })]).lieux).toEqual([
      {
        lieuId: 'e4b5f0d4-5a1f-4a5a-9a4e-2e1c9f0b1d2c',
        nom: 'Espace numérique de Reims',
        commune: 'Reims',
        codePostal: '51100',
        publie: true,
        listesATrier: ['services'],
        horaires: null,
      },
    ])
  })
})

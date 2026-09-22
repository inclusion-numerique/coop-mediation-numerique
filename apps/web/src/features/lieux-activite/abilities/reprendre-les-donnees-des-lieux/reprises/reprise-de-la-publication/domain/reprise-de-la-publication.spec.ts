import { relever } from '../../../domain'
import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import { repriseDeLaPublication } from './reprise-de-la-publication'

const sansEcrire = repriseDeLaPublication(async () => undefined)

const mentions = (champs: Parameters<typeof lieuAReprendre>[0]) =>
  relever([sansEcrire], [lieuAReprendre(champs)]).lieux.flatMap(
    ({ constats }) => constats.flatMap(({ mentions }) => mentions),
  )

describe('la publication d’un lieu sans service', () => {
  it('se retire', () => {
    expect(mentions({ publie: true, services: [] })).toEqual([
      {
        colonne: 'publication',
        cellule: 'à retirer',
        motif: 'publication : à retirer',
      },
    ])
  })

  it('se retire même quand le lieu annonce une typologie', () => {
    expect(
      mentions({ publie: true, services: [], typologies: ['TIERS_LIEUX'] }),
    ).toHaveLength(1)
  })

  it('reste quand le lieu annonce un service', () => {
    expect(mentions({ publie: true, services: ['Aide'] })).toEqual([])
  })

  it('ne concerne pas un lieu que personne ne voit', () => {
    expect(mentions({ publie: false, services: [] })).toEqual([])
  })
})

import { relever } from '../../../domain'
import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import { repriseDeLaPublication } from './reprise-de-la-publication'

const sansEcrire = repriseDeLaPublication(async () => undefined)

const mentions = async (champs: Parameters<typeof lieuAReprendre>[0]) =>
  (await relever([sansEcrire], [lieuAReprendre(champs)])).lieux.flatMap(
    ({ constats }) => constats.flatMap(({ mentions }) => mentions),
  )

describe('la publication d’un lieu sans service', () => {
  it('se retire', async () => {
    expect(await mentions({ publie: true, services: [] })).toEqual([
      {
        colonne: 'publication',
        cellule: 'à retirer',
        motif: 'publication : à retirer',
      },
    ])
  })

  it('se retire même quand le lieu annonce une typologie', async () => {
    expect(
      await mentions({
        publie: true,
        services: [],
        typologies: ['TIERS_LIEUX'],
      }),
    ).toHaveLength(1)
  })

  it('reste quand le lieu annonce un service', async () => {
    expect(await mentions({ publie: true, services: ['Aide'] })).toEqual([])
  })

  it('ne concerne pas un lieu que personne ne voit', async () => {
    expect(await mentions({ publie: false, services: [] })).toEqual([])
  })
})

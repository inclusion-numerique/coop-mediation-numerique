import { derniereEcriture, type HorodatagesDeSource } from './derniere-ecriture'

const LE_1ER_JANVIER = new Date('2026-01-01T10:00:00Z')
const LE_1ER_MARS = new Date('2026-03-01T10:00:00Z')
const LE_1ER_JUIN = new Date('2026-06-01T10:00:00Z')

const horodatages = (
  surcharge: Partial<HorodatagesDeSource> = {},
): HorodatagesDeSource => ({
  updatedAtCarto: null,
  updatedAtCoop: null,
  updatedAtMin: null,
  ...surcharge,
})

describe('la dernière écriture sur un lieu, toutes sources confondues', () => {
  it('est celle de la coop quand le lieu n’est pas inscrit', () => {
    expect(derniereEcriture(null, LE_1ER_MARS)).toEqual(LE_1ER_MARS)
  })

  it('est celle de la coop quand l’inscription n’a aucun horodatage', () => {
    expect(derniereEcriture(horodatages(), LE_1ER_MARS)).toEqual(LE_1ER_MARS)
  })

  it('retient la reprise externe quand elle est passée après la coop', () => {
    expect(
      derniereEcriture(
        horodatages({ updatedAtCarto: LE_1ER_JUIN }),
        LE_1ER_MARS,
      ),
    ).toEqual(LE_1ER_JUIN)
  })

  it('garde la coop quand la reprise externe lui est antérieure', () => {
    expect(
      derniereEcriture(
        horodatages({ updatedAtCarto: LE_1ER_JANVIER }),
        LE_1ER_MARS,
      ),
    ).toEqual(LE_1ER_MARS)
  })

  it('retient la plus récente des trois sources', () => {
    expect(
      derniereEcriture(
        horodatages({
          updatedAtCarto: LE_1ER_JANVIER,
          updatedAtCoop: LE_1ER_MARS,
          updatedAtMin: LE_1ER_JUIN,
        }),
        LE_1ER_JANVIER,
      ),
    ).toEqual(LE_1ER_JUIN)
  })
})

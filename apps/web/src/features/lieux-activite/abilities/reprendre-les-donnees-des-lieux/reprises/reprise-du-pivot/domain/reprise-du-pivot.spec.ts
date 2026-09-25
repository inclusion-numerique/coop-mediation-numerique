import { relever } from '../../../domain'
import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import { repriseDuPivot } from './reprise-du-pivot'

const sansEcrire = repriseDuPivot(async () => undefined)

const mentions = async (rna: string | null) =>
  (await relever([sansEcrire], [lieuAReprendre({ rna })])).lieux.flatMap(
    ({ constats }) => constats.flatMap(({ mentions }) => mentions),
  )

describe('le RNA, que le standard n’immatricule plus', () => {
  it('s’efface, et le relevé montre sa valeur', async () => {
    expect(await mentions('W751234567')).toEqual([
      { colonne: 'rna', cellule: 'W751234567', motif: 'rna : à effacer' },
    ])
  })

  it('ne concerne pas un lieu qui n’en porte pas', async () => {
    expect(await mentions(null)).toEqual([])
  })

  it('ne concerne pas un lieu dont la colonne ne porte que du blanc', async () => {
    expect(await mentions('   ')).toEqual([])
  })
})

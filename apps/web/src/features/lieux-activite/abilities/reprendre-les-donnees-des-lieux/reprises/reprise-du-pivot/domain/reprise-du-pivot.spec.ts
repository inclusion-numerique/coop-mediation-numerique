import { relever } from '../../../domain'
import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import { repriseDuPivot } from './reprise-du-pivot'

const sansEcrire = repriseDuPivot(async () => undefined)

const mentions = (rna: string | null) =>
  relever([sansEcrire], [lieuAReprendre({ rna })]).lieux.flatMap(
    ({ constats }) => constats.flatMap(({ mentions }) => mentions),
  )

describe('le RNA, que le standard n’immatricule plus', () => {
  it('s’efface, et le relevé montre sa valeur', () => {
    expect(mentions('W751234567')).toEqual([
      { colonne: 'rna', cellule: 'W751234567', motif: 'rna : à effacer' },
    ])
  })

  it('ne concerne pas un lieu qui n’en porte pas', () => {
    expect(mentions(null)).toEqual([])
  })

  it('ne concerne pas un lieu dont la colonne ne porte que du blanc', () => {
    expect(mentions('   ')).toEqual([])
  })
})

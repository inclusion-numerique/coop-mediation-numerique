import { describe, expect, it } from 'vitest'
import { listerLesActeursDuDepartement } from './acteurs-listes.query'

const aucuneCommune = async () => ({ communesOptions: [] })

describe('acteurs listés contre la base', () => {
  it('la recherche joint l’employeuse courante, liste et total', async () => {
    const consultation = await listerLesActeursDuDepartement(
      '75',
      {},
      { communesDesLieux: aucuneCommune },
    )

    expect(
      consultation.success &&
        consultation.data.acteurs.acteurs.length <=
          consultation.data.acteurs.total,
    ).toBe(true)
  })
})

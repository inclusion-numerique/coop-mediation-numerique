import { describe, expect, it } from 'vitest'
import { criteresDesActeursDuReseau } from '../../ui/filtres/acteurs-du-reseau.filtre'
import { listerLesActeursDuDepartement } from './acteurs-listes.query'

const aucuneCommune = async () => ({ communesOptions: [] })

describe('acteurs listés contre la base', () => {
  it('la recherche joint l’employeuse courante, liste et total', async () => {
    const consultation = await listerLesActeursDuDepartement(
      '75',
      criteresDesActeursDuReseau({}),
      { communesDesLieux: aucuneCommune },
    )

    expect(
      consultation.success &&
        consultation.data.acteurs.items.length <=
          consultation.data.acteurs.totalItems,
    ).toBe(true)
  })
})

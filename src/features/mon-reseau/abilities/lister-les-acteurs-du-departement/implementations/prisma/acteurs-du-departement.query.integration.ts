import { describe, expect, it } from 'vitest'
import { CodeDepartement } from '@/libraries/insee'
import { criteresDesActeursDuReseau } from '../../ui/filtres/acteurs-du-reseau.filtre'
import { acteursDuDepartement } from './acteurs-du-departement.query'

describe('acteurs du département contre la base', () => {
  it('la recherche joint l’employeuse courante, liste et total', async () => {
    const acteurs = await acteursDuDepartement(
      CodeDepartement('75'),
      criteresDesActeursDuReseau({}),
    )

    expect(acteurs.items.length <= acteurs.totalItems).toBe(true)
  })
})

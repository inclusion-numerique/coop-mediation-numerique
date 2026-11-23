import { describe, expect, it } from 'vitest'
import { consulterLeReseauDuDepartement } from './reseau-du-departement.query'

const aucunLieu = async () => 0

describe('réseau du département contre la base', () => {
  it('le comptage joint l’employeuse courante', async () => {
    const reseau = await consulterLeReseauDuDepartement('75', {
      nombreDeLieuxDuDepartement: aucunLieu,
    })

    expect(reseau.success && typeof reseau.data.acteurs).toBe('number')
  })
})

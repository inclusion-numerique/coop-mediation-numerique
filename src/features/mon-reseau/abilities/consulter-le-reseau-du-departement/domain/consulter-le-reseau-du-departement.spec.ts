import { describe, expect, it } from 'vitest'
import { Effectif } from '../../../domain'
import { consulterLeReseauDuDepartement } from './consulter-le-reseau-du-departement'

const consulter = consulterLeReseauDuDepartement({
  compterLesActeursDuDepartement: async () => Effectif(42),
  nombreDeLieuxDuDepartement: async () => 12,
})

describe('consulter le réseau du département', () => {
  it('compte les acteurs et les lieux du département', async () => {
    expect(await consulter({ code: '15' })).toEqual({
      success: true,
      data: {
        departement: { code: '15', nom: 'Cantal' },
        acteurs: 42,
        lieux: 12,
      },
    })
  })

  it('refuse un département inconnu', async () => {
    expect(await consulter({ code: '00' })).toEqual({
      success: false,
      error: { _tag: 'DepartementInconnu', code: '00' },
    })
  })
})

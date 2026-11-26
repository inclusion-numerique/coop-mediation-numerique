import { describe, expect, it } from 'vitest'
import { type Departement, NomDepartement } from '@/libraries/departement'
import { CodeDepartement } from '@/libraries/insee'
import { Effectif } from '../../../domain'
import { consulterLeReseauDuDepartement } from './consulter-le-reseau-du-departement'

const cantal: Departement = {
  code: CodeDepartement('15'),
  nom: NomDepartement('Cantal'),
}

const consulter = consulterLeReseauDuDepartement({
  compterLesActeursDuDepartement: async () => Effectif(42),
  nombreDeLieuxDuDepartement: async () => Effectif(12),
})

describe('consulter le réseau du département', () => {
  it('compte les acteurs et les lieux du département', async () => {
    expect(await consulter({ departement: cantal })).toEqual({
      success: true,
      data: { departement: cantal, acteurs: 42, lieux: 12 },
    })
  })

  it('refuse un département inconnu', async () => {
    expect(await consulter({ departement: null })).toEqual({
      success: false,
      error: { _tag: 'DepartementInconnu' },
    })
  })
})

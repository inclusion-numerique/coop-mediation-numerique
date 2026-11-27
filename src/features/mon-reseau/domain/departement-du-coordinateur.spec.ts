import { describe, expect, it } from 'vitest'
import { CodeInsee } from '@/libraries/insee'
import { departementDuCoordinateur } from './departement-du-coordinateur'

describe('département du coordinateur', () => {
  it('se déduit de la commune de son employeuse', () => {
    expect(
      departementDuCoordinateur({ communeDeLEmployeuse: CodeInsee('15014') }),
    ).toBe('15')
  })

  it('est le département par défaut sans commune d’employeuse', () => {
    expect(departementDuCoordinateur({ communeDeLEmployeuse: null })).toBe('75')
  })
})

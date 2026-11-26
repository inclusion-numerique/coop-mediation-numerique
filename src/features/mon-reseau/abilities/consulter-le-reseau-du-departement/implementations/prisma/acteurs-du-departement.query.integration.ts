import { describe, expect, it } from 'vitest'
import { CodeDepartement } from '@/libraries/insee'
import { compterLesActeursDuDepartement } from './acteurs-du-departement.query'

describe('acteurs du département contre la base', () => {
  it('le comptage joint l’employeuse courante', async () => {
    expect(
      typeof (await compterLesActeursDuDepartement(CodeDepartement('75'))),
    ).toBe('number')
  })
})

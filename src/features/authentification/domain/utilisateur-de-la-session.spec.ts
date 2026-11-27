import { describe, expect, it } from 'vitest'
import { aUneStructureEmployeuse } from './utilisateur-de-la-session'

describe('utilisateur de la session', () => {
  it('a une structure employeuse dès qu’il occupe un emploi', () => {
    expect(
      aUneStructureEmployeuse({
        emplois: [
          {
            id: 'emploi-1',
            structure: { nom: 'Médiathèque', codeInsee: null },
          },
        ],
      }),
    ).toBe(true)
  })

  it('n’a pas de structure employeuse sans emploi', () => {
    expect(aUneStructureEmployeuse({ emplois: [] })).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { sousTitreDeMesCoordinations } from './sous-titre.presenter'

describe('sous-titre de mes coordinations', () => {
  it('précise la coordination à qui fait aussi de la médiation', () => {
    expect(sousTitreDeMesCoordinations(true)).toBe('Coordination')
  })

  it("n'a pas de sous-titre pour un coordinateur seul", () => {
    expect(sousTitreDeMesCoordinations(false)).toBeUndefined()
  })
})

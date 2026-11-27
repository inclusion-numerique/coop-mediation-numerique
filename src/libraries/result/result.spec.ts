import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  type Failure,
  failure,
  type Result,
  type Success,
  success,
} from './result'

describe('résultat', () => {
  it('porte la donnée d’un succès', () => {
    expect(success(42)).toEqual({ success: true, data: 42 })
  })

  it('porte l’erreur d’un échec', () => {
    expect(failure({ _tag: 'Introuvable' })).toEqual({
      success: false,
      error: { _tag: 'Introuvable' },
    })
  })

  it('admet le succès et l’échec quand une erreur est possible', () => {
    expectTypeOf<Result<number, string>>().toEqualTypeOf<
      Success<number> | Failure<string>
    >()
  })

  it('se réduit au succès quand l’échec est impossible', () => {
    expectTypeOf<Result<number, never>>().toEqualTypeOf<Success<number>>()
  })

  it('reste une union quand l’erreur est elle-même une union', () => {
    expectTypeOf<Result<number, 'a' | 'b'>>().toEqualTypeOf<
      Success<number> | Failure<'a' | 'b'>
    >()
  })
})

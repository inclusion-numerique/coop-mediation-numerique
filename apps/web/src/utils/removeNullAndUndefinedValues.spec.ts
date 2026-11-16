import { removeNullAndUndefinedValues } from '@app/web/utils/removeNullAndUndefinedValues'
import { describe, expect, it } from 'vitest'

describe('removeNullAndUndefinedValues', () => {
  it('Removes null and values', () => {
    expect(
      removeNullAndUndefinedValues({
        a: '',
        b: 0,
        c: {},
        d: [],
        e: null,
        f: undefined,
        g: Number.NaN,
      }),
    ).toEqual({ a: '', b: 0, c: {}, d: [], g: Number.NaN })
  })
})

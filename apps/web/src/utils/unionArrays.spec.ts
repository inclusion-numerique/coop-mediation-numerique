import { unionArrays } from './unionArrays'

describe('unionArrays', () => {
  it('returns union of two arrays without duplicates', () => {
    expect(unionArrays(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c'])
  })

  it('returns empty array when both inputs are empty', () => {
    expect(unionArrays([], [])).toEqual([])
  })

  it('returns first array when second is empty', () => {
    expect(unionArrays(['a', 'b'], [])).toEqual(['a', 'b'])
  })

  it('returns second array when first is empty', () => {
    expect(unionArrays([], ['a', 'b'])).toEqual(['a', 'b'])
  })

  it('handles arrays with all duplicates', () => {
    expect(unionArrays(['a', 'b'], ['a', 'b'])).toEqual(['a', 'b'])
  })
})

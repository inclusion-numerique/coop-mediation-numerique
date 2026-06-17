import { TrancheAge } from './tranche-age'

describe('TrancheAge', () => {
  it('accepts a provided tranche', () => {
    expect(TrancheAge('VingtCinqTrenteNeuf')).toBe('VingtCinqTrenteNeuf')
  })

  it('defaults to NonCommunique when absent', () => {
    expect(TrancheAge(null)).toBe('NonCommunique')
    expect(TrancheAge(undefined)).toBe('NonCommunique')
  })
})

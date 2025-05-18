import { getStartOfDay } from './getStartOfDay'

describe('getStartOfDay', () => {
  it('returns date at start of day', () => {
    const result = getStartOfDay(new Date('2025-04-20T08:00:00+02:00'))

    expect(result).toEqual(new Date('2025-04-20T00:00:00+02:00'))
  })
})

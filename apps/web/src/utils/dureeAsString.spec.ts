import { dureeAsString } from '@app/web/utils/dureeAsString'

describe('dureeAsString', () => {
  // use jest cases each

  const cases = [
    { value: 15, expected: '15mn' },
    { value: 30.1, expected: '30mn' },
    { value: 45, expected: '45mn' },
    { value: 60, expected: '1h' },
    { value: 90, expected: '1h30' },
    { value: 120, expected: '2h' },
    { value: 145.8, expected: '2h26' },
    { value: 0, expected: '0mn' },
  ]

  test.each(cases)('should format $value to $expected', ({
    value,
    expected,
  }) => {
    expect(dureeAsString(value)).toEqual(expected)
  })
})

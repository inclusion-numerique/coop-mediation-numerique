import { Telephone } from './telephone'

describe('Telephone', () => {
  it.each([
    '0102030405',
    '01 02 03 04 05',
    '01.02.03.04.05',
    '01-02-03-04-05',
    '+33102030405',
    '+33 1 02 03 04 05',
    '0033102030405',
    '(+33)102030405',
    '+590690000001',
    '+262262202020',
  ])('accepts the valid number %s', (value) => {
    expect(Telephone(value)).toBe(value)
  })

  it.each([
    '',
    '123',
    '01020304',
    'abcdefghij',
    '+1234567890',
    '00112030405',
  ])('rejects the invalid number %s', (value) => {
    expect(() => Telephone(value)).toThrow()
  })
})

import { Email } from './email'

describe('Email', () => {
  it('trims and lowercases', () => {
    expect(Email('  Jean.DUPONT@Example.COM  ')).toBe('jean.dupont@example.com')
  })

  it('rejects an invalid email', () => {
    expect(() => Email('not-an-email')).toThrow()
  })
})

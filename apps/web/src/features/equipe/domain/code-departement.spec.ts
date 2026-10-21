import { CodeDepartement } from './code-departement'

describe('code département', () => {
  it.each([
    ['métropolitain', '69'],
    ['corse', '2A'],
    ['d’outre-mer', '974'],
  ])('accepte un département %s', (_, code) => {
    expect(CodeDepartement(code)).toBe(code)
  })

  it.each(['6', '69001', '2C'])('refuse %s', (code) => {
    expect(CodeDepartement.safe(code)).toBeNull()
  })
})

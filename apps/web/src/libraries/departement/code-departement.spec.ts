import { CodeDepartement, codeDepartementDuCodeInsee } from './code-departement'
import { CodeInsee } from './code-insee'

describe('code département', () => {
  it.each([
    ['métropolitain', '69'],
    ['corse', '2A'],
    ['d’outre-mer', '974'],
    ['de Nouvelle-Calédonie', '988'],
  ])('accepte un département %s', (_, code) => {
    expect(CodeDepartement(code)).toBe(code)
  })

  it.each(['6', '69001', '2C', '2A5'])('refuse %s', (code) => {
    expect(CodeDepartement.safe(code)).toBeNull()
  })

  it.each([
    ['69123', '69'],
    ['2A004', '2A'],
    ['97411', '974'],
    ['98818', '988'],
  ])('lit le département de la commune %s', (codeInsee, attendu) => {
    expect(codeDepartementDuCodeInsee(CodeInsee(codeInsee))).toBe(attendu)
  })
})

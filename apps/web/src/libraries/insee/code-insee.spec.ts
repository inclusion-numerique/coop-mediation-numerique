import { CodeInsee } from './code-insee'

describe('code INSEE', () => {
  it.each([
    ['métropolitaine', '69123'],
    ['corse', '2A004'],
    ['d’outre-mer', '97411'],
  ])('accepte une commune %s', (_, code) => {
    expect(CodeInsee(code)).toBe(code)
  })

  it('met la Corse en majuscules', () => {
    expect(CodeInsee(' 2a004 ')).toBe('2A004')
  })

  it.each(['1A123', '2C004', '6912', '691234', '4173', ''])(
    'refuse %s',
    (code) => {
      expect(CodeInsee.safe(code)).toBeNull()
    },
  )
})

import { CodePostal } from './code-postal'

describe('code postal', () => {
  it('retire les espaces', () => {
    expect(CodePostal(' 44 000 ')).toBe('44000')
  })

  it.each(['4400', '440000', '2A000'])('refuse %s', (code) => {
    expect(CodePostal.safe(code)).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { contientSansAccent } from './sans-accent'

describe('recherche sans accent', () => {
  it('trouve un texte accentué par une saisie sans accent', () => {
    expect(contientSansAccent('Hélène Dupré', 'helene')).toBe(true)
  })

  it('ignore la casse', () => {
    expect(contientSansAccent('Médiathèque', 'MEDIA')).toBe(true)
  })

  it('ne trouve pas un texte absent', () => {
    expect(contientSansAccent('Médiathèque', 'mairie')).toBe(false)
  })
})

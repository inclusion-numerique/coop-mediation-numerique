import { describe, expect, it } from 'vitest'
import { Notes } from './notes'

describe('notes d’un bénéficiaire', () => {
  it('retire le code qui s’exécuterait à l’affichage', () => {
    expect(Notes('<p>Suivi</p><script>alert(1)</script>')).toBe('<p>Suivi</p>')
  })

  it('refuse une note qui ne contient que du code', () => {
    expect(Notes.safe('<script>alert(1)</script>')).toBeNull()
  })
})

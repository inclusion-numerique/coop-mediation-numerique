import { describe, expect, it } from 'vitest'
import { Notes, NotesSaisies, notesDe } from './notes'

describe('notes d’une activité', () => {
  it('un texte riche sans contenu ne donne pas de notes', () => {
    expect(notesDe('<p> <br/> </p><p></p>')).toBeNull()
  })

  it('un texte riche avec du contenu donne des notes', () => {
    expect(notesDe('<p>Atelier mail</p>')).toBe(Notes('<p>Atelier mail</p>'))
  })

  it('un texte qui fait reculer une expression régulière est lu sans délai', () => {
    expect(notesDe(`<p>${' </p><p>'.repeat(40)}!`)).not.toBeNull()
  }, 1000)

  it('des notes saisies trop longues sont refusées', () => {
    expect(NotesSaisies.safeParse('a'.repeat(10_001)).success).toBe(false)
  })

  it('retire d’une note le code qui s’exécuterait à l’affichage', () => {
    expect(notesDe('<p>Atelier</p><script>alert(1)</script>')).toBe(
      Notes('<p>Atelier</p>'),
    )
  })

  it('une note qui ne contient que du code ne donne pas de notes', () => {
    expect(notesDe('<p><script>alert(1)</script></p>')).toBeNull()
  })
})

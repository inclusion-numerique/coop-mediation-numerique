import { describe, expect, it } from 'vitest'
import { assainirLeTexteRiche } from './assainir-le-texte-riche'

describe('assainir un texte riche', () => {
  it('garde la mise en forme de l’éditeur', () => {
    expect(
      assainirLeTexteRiche(
        '<p><strong>Gras</strong> <em>italique</em></p><ul><li>un</li></ul>',
      ),
    ).toBe('<p><strong>Gras</strong> <em>italique</em></p><ul><li>un</li></ul>')
  })

  it('retire un script', () => {
    expect(assainirLeTexteRiche('<p>a</p><script>alert(1)</script>')).toBe(
      '<p>a</p>',
    )
  })

  it('retire un attribut de gestionnaire d’événement', () => {
    expect(assainirLeTexteRiche('<p onclick="alert(1)">a</p>')).toBe('<p>a</p>')
  })

  it('retire une image', () => {
    expect(assainirLeTexteRiche('<img src=x onerror="alert(1)">')).toBe('')
  })

  it('retire un cadre et son contenu', () => {
    expect(
      assainirLeTexteRiche(
        '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
      ),
    ).toBe('')
  })

  it('retire un lien javascript', () => {
    expect(assainirLeTexteRiche('<a href="javascript:alert(1)">a</a>')).toBe(
      '<a rel="noopener noreferrer nofollow">a</a>',
    )
  })

  it('garde un lien web en l’ouvrant sans transmettre la page d’origine', () => {
    expect(assainirLeTexteRiche('<a href="https://exemple.fr">a</a>')).toBe(
      '<a href="https://exemple.fr" rel="noopener noreferrer nofollow">a</a>',
    )
  })
})

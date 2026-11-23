import { describe, expect, it } from 'vitest'
import { PresentationDetailSaisi } from './regles-de-saisie'

describe('présentation détaillée saisie', () => {
  it('retire le code qui s’exécuterait à l’affichage', () => {
    expect(
      PresentationDetailSaisi.parse('<p>Accueil</p><script>alert(1)</script>'),
    ).toBe('<p>Accueil</p>')
  })
})

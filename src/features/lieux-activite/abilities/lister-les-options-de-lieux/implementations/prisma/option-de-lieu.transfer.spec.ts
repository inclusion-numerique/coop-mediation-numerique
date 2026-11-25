import { describe, expect, it } from 'vitest'
import { adresseComplete, optionDeLieu } from './option-de-lieu.transfer'

const LIEU = {
  id: 'lieu-1',
  nom: 'Médiathèque Jean Macé',
  adresse: '12 rue des Lilas',
  codePostal: '69003',
  commune: 'Lyon',
}

describe('adresseComplete', () => {
  it('joint l’adresse, le code postal et la commune', () => {
    expect(
      adresseComplete({
        adresse: '12 rue des Lilas',
        codePostal: '69003',
        commune: 'Lyon',
      }),
    ).toBe('12 rue des Lilas, 69003 Lyon')
  })
})

describe('optionDeLieu', () => {
  it('traduit un lieu en option de sélection', () => {
    expect(optionDeLieu(LIEU, 3, 1)).toEqual({
      value: 'lieu-1',
      label: 'Médiathèque Jean Macé',
      extra: {
        nom: 'Médiathèque Jean Macé',
        adresse: '12 rue des Lilas, 69003 Lyon',
        activites: 3,
        mostUsed: false,
      },
    })
  })

  it('marque le premier lieu comme le plus utilisé quand il a des activités', () => {
    expect(optionDeLieu(LIEU, 1, 0).extra?.mostUsed).toBe(true)
  })

  it('ne marque pas le premier lieu comme le plus utilisé sans activité', () => {
    expect(optionDeLieu(LIEU, 0, 0).extra?.mostUsed).toBe(false)
  })

  it('ne marque pas un lieu suivant comme le plus utilisé, même avec des activités', () => {
    expect(optionDeLieu(LIEU, 12, 1).extra?.mostUsed).toBe(false)
  })
})

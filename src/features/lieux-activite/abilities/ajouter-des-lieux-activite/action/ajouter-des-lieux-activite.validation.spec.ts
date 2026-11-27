import { describe, expect, it } from 'vitest'
import { LieuxAAjouterValidation } from './ajouter-des-lieux-activite.validation'

const lieu = {
  nom: 'Tiers-lieu du Port',
  adresse: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
}

describe('la validation du panier de lieux', () => {
  it('accepte un SIRET de quatorze chiffres', () => {
    expect(
      LieuxAAjouterValidation.safeParse({
        lieux: [{ ...lieu, siret: '13002603200016' }],
      }).success,
    ).toBe(true)
  })

  it('refuse un SIRET mal formé plutôt que de l’oublier', () => {
    expect(
      LieuxAAjouterValidation.safeParse({
        lieux: [{ ...lieu, siret: '1300260320' }],
      }).success,
    ).toBe(false)
  })
})

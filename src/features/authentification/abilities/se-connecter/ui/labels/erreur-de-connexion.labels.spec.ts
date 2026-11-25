import { describe, expect, it } from 'vitest'
import { connexionImpossibleMessage } from './erreur-de-connexion.labels'

describe('connexionImpossibleMessage', () => {
  it('signale un lien de connexion qui n’est plus valide', () => {
    expect(connexionImpossibleMessage('Verification')).toBe(
      "Le lien de connexion n'est plus valide. Il a peut-être déjà été utilisé ou est expiré.",
    )
  })

  it('rend un message générique pour toute autre erreur', () => {
    expect(connexionImpossibleMessage('OAuthCallback')).toBe(
      'Une erreur est survenue lors de la connexion. Veuillez réessayer.',
    )
  })

  it('rend un message générique sans erreur précisée', () => {
    expect(connexionImpossibleMessage(undefined)).toBe(
      'Une erreur est survenue lors de la connexion. Veuillez réessayer.',
    )
  })
})

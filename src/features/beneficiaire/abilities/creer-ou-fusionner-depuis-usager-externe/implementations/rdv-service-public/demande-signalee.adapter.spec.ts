import { describe, expect, it } from 'vitest'
import { RdvUserId } from '../../domain/rdv-user-id'
import { valeurInvalideEnErreur } from './demande-signalee.adapter'

describe('valeur invalide reçue de RDV Service Public', () => {
  it('nomme l’usager et le champ, sans en donner la valeur', () => {
    expect(
      valeurInvalideEnErreur({ rdvUserId: RdvUserId(42), champ: 'email' })
        .message,
    ).toBe(
      'Usager RDV 42 : email invalide reçu de RDV Service Public, ignoré pour la fusion',
    )
  })
})

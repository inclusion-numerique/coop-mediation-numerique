import { describe, expect, it } from 'vitest'
import { lireLUtilisateurALaConnexion } from './utilisateur-a-la-connexion.transfer'

describe('utilisateur à la connexion par courriel', () => {
  it('lit comme absents les champs que next-auth ne fournit pas', () => {
    expect(
      lireLUtilisateurALaConnexion({ id: 'u1', email: 'lea@example.fr' }).data,
    ).toEqual({
      id: 'u1',
      email: 'lea@example.fr',
      firstName: null,
      lastName: null,
      phone: null,
      siret: null,
    })
  })

  it('refuse un utilisateur sans adresse', () => {
    expect(lireLUtilisateurALaConnexion({ id: 'u1' }).success).toBe(false)
  })
})

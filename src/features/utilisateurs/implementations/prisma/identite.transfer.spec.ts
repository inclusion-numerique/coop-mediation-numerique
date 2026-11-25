import { describe, expect, it } from 'vitest'
import { AdresseCourriel, Nom, NomAffiche, Prenom } from '../../domain'
import { type IdentiteRow, identiteToDomain } from './identite.transfer'

const ligne: IdentiteRow = {
  firstName: 'Jeanne',
  lastName: 'Martin',
  name: 'Jeanne Martin',
  email: 'Jeanne.Martin@Example.com',
}

describe('identité lue en base', () => {
  it('lit une identité complète', () => {
    expect(identiteToDomain(ligne)).toEqual({
      prenom: Prenom('Jeanne'),
      nom: Nom('Martin'),
      nomComplet: NomAffiche('Jeanne Martin'),
      courriel: AdresseCourriel('jeanne.martin@example.com'),
    })
  })

  it.each([
    ['absentes', null],
    ['blanches', '  '],
  ])('lit des parties de nom %s comme une absence', (_, valeur) => {
    expect(
      identiteToDomain({
        ...ligne,
        firstName: valeur,
        lastName: valeur,
        name: valeur,
      }),
    ).toEqual({
      prenom: null,
      nom: null,
      nomComplet: null,
      courriel: AdresseCourriel('jeanne.martin@example.com'),
    })
  })

  it('rejette un courriel illisible', () => {
    expect(() =>
      identiteToDomain({ ...ligne, email: 'pas un courriel' }),
    ).toThrow()
  })
})

import { memeNom, NomTag } from './nom-tag'

describe('identité d’un nom de tag', () => {
  it('reconnaît deux écritures du même nom', () => {
    expect(
      memeNom(NomTag('Accès aux droits'), NomTag('accès aux droits')),
    ).toBe(true)
  })

  it('ignore les espaces qui entourent', () => {
    expect(memeNom(NomTag('  Numérique  '), NomTag('numérique'))).toBe(true)
  })

  it('distingue deux noms différents', () => {
    expect(memeNom(NomTag('Numérique'), NomTag('Numérique de base'))).toBe(
      false,
    )
  })

  // Les accents ne sont PAS normalisés : « Accès » et « Acces » restent deux
  // tags distincts. C'est le comportement actuel, pinné pour qu'un changement
  // soit un choix et non une surprise.
  it('distingue un nom accentué de sa forme sans accent', () => {
    expect(memeNom(NomTag('Accès'), NomTag('Acces'))).toBe(false)
  })
})

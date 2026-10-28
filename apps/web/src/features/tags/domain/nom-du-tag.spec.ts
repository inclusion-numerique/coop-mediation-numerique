import { memeNom, NomDuTag } from './nom-du-tag'

describe('identité d’un nom de tag', () => {
  it('reconnaît deux écritures du même nom', () => {
    expect(
      memeNom(NomDuTag('Accès aux droits'), NomDuTag('accès aux droits')),
    ).toBe(true)
  })

  it('ignore les espaces qui entourent', () => {
    expect(memeNom(NomDuTag('  Numérique  '), NomDuTag('numérique'))).toBe(true)
  })

  it('distingue deux noms différents', () => {
    expect(memeNom(NomDuTag('Numérique'), NomDuTag('Numérique de base'))).toBe(
      false,
    )
  })

  it('distingue un nom accentué de sa forme sans accent', () => {
    expect(memeNom(NomDuTag('Accès'), NomDuTag('Acces'))).toBe(false)
  })
})

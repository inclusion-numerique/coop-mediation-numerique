import { ChoisirProfilValidation } from './choisir-profil.validation'

describe('ChoisirProfilValidation', () => {
  it('projette un rôle choisi valide avec CGU acceptées', () => {
    expect(
      ChoisirProfilValidation.parse({ role: 'Mediateur', cguAcceptee: true }),
    ).toEqual({ role: 'Mediateur' })
  })

  it('rejette si les CGU ne sont pas acceptées', () => {
    expect(
      ChoisirProfilValidation.safeParse({
        role: 'Coordinateur',
        cguAcceptee: false,
      }).success,
    ).toBe(false)
  })

  it('rejette un rôle non choisissable', () => {
    expect(
      ChoisirProfilValidation.safeParse({
        role: 'ConseillerNumerique',
        cguAcceptee: true,
      }).success,
    ).toBe(false)
  })
})

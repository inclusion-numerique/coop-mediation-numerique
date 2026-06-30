import { ChoisirProfilValidation } from './choisir-profil.validation'

describe('ChoisirProfilValidation', () => {
  it('projette un profil choisi valide avec CGU acceptées', () => {
    expect(
      ChoisirProfilValidation.parse({ profil: 'Mediateur', cguAcceptee: true }),
    ).toEqual({ profil: 'Mediateur' })
  })

  it('rejette si les CGU ne sont pas acceptées', () => {
    expect(
      ChoisirProfilValidation.safeParse({
        profil: 'Coordinateur',
        cguAcceptee: false,
      }).success,
    ).toBe(false)
  })

  it('rejette un profil non choisissable', () => {
    expect(
      ChoisirProfilValidation.safeParse({
        profil: 'ConseillerNumerique',
        cguAcceptee: true,
      }).success,
    ).toBe(false)
  })
})

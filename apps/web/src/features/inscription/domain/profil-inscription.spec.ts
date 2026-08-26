import { computeUserProfile } from './profil-inscription'

describe('computeUserProfile', () => {
  it('médiateur par défaut', () => {
    expect(
      computeUserProfile({
        isConseillerNumerique: false,
        isCoordinateur: false,
      }),
    ).toBe('Mediateur')
  })

  it('conseiller numérique sans coordination', () => {
    expect(
      computeUserProfile({
        isConseillerNumerique: true,
        isCoordinateur: false,
      }),
    ).toBe('ConseillerNumerique')
  })

  it('coordinateur sans conseiller numérique', () => {
    expect(
      computeUserProfile({
        isConseillerNumerique: false,
        isCoordinateur: true,
      }),
    ).toBe('Coordinateur')
  })

  it('coordinateur conseiller numérique', () => {
    expect(
      computeUserProfile({ isConseillerNumerique: true, isCoordinateur: true }),
    ).toBe('CoordinateurConseillerNumerique')
  })
})

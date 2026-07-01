import { computeUserProfile } from './profil-inscription'

describe('computeUserProfile', () => {
  it('médiateur par défaut', () => {
    expect(
      computeUserProfile({
        isConseillerNumerique: false,
        aCoordinateur: false,
      }),
    ).toBe('Mediateur')
  })

  it('conseiller numérique sans coordination', () => {
    expect(
      computeUserProfile({ isConseillerNumerique: true, aCoordinateur: false }),
    ).toBe('ConseillerNumerique')
  })

  it('coordinateur sans conseiller numérique', () => {
    expect(
      computeUserProfile({ isConseillerNumerique: false, aCoordinateur: true }),
    ).toBe('Coordinateur')
  })

  it('coordinateur conseiller numérique', () => {
    expect(
      computeUserProfile({ isConseillerNumerique: true, aCoordinateur: true }),
    ).toBe('CoordinateurConseillerNumerique')
  })
})

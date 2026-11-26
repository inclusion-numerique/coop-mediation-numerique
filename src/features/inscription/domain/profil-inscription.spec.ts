import { describe, expect, it } from 'vitest'
import { libelleDuProfil, profilDInscription } from './profil-inscription'

describe('profilDInscription', () => {
  it('médiateur par défaut', () => {
    expect(
      profilDInscription({
        isConseillerNumerique: false,
        isCoordinateur: false,
      }),
    ).toBe('Mediateur')
  })

  it('conseiller numérique sans coordination', () => {
    expect(
      profilDInscription({
        isConseillerNumerique: true,
        isCoordinateur: false,
      }),
    ).toBe('ConseillerNumerique')
  })

  it('coordinateur sans conseiller numérique', () => {
    expect(
      profilDInscription({
        isConseillerNumerique: false,
        isCoordinateur: true,
      }),
    ).toBe('Coordinateur')
  })

  it('coordinateur conseiller numérique', () => {
    expect(
      profilDInscription({ isConseillerNumerique: true, isCoordinateur: true }),
    ).toBe('CoordinateurConseillerNumerique')
  })
})

describe('libelleDuProfil', () => {
  it('nomme le profil pour l’affichage', () => {
    expect(libelleDuProfil('CoordinateurConseillerNumerique')).toBe(
      'Coordinateur·rice de conseillers numériques',
    )
  })
})

import {
  coordinateurConseillerNumerique,
  mediateurHorsDispositif,
} from '../domain/fixtures'
import {
  iconeDuProfil,
  libelleDesLieux,
  libelleDuProfil,
} from './profil.presenter'

describe('présentation du profil d’un acteur', () => {
  it('nomme un coordinateur du dispositif et montre son icône', () => {
    expect(libelleDuProfil(coordinateurConseillerNumerique.profil)).toBe(
      'Coordinateur·rice de conseillers numériques',
    )
    expect(iconeDuProfil(coordinateurConseillerNumerique.profil)).toBe(
      '/images/iconographie/profil-coordinateur-conseiller-numerique-minimal.svg',
    )
  })

  it('n’a pas d’icône pour un médiateur hors dispositif', () => {
    expect(libelleDuProfil(mediateurHorsDispositif.profil)).toBe(
      'Médiateur·rice numérique',
    )
    expect(iconeDuProfil(mediateurHorsDispositif.profil)).toBeNull()
  })

  it.each([
    [1, '1 lieu d’activité'],
    [3, '3 lieux d’activité'],
  ])('compte %i lieu(x) d’activité', (nombre, attendu) => {
    expect(libelleDesLieux(nombre)).toBe(attendu)
  })
})

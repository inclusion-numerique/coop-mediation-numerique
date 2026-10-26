import { profilDuMediateur } from './profil-du-mediateur'

describe('profil d’un médiateur du lieu', () => {
  it.each([
    [false, false, 'Mediateur'],
    [false, true, 'ConseillerNumerique'],
    [true, false, 'CoordinateurHorsDispositif'],
    [true, true, 'CoordinateurConseillerNumerique'],
  ])(
    'coordinateur %s, conseiller numérique %s : %s',
    (estCoordinateur, estConseillerNumerique, attendu) => {
      expect(
        profilDuMediateur({ estCoordinateur, estConseillerNumerique }),
      ).toBe(attendu)
    },
  )
})

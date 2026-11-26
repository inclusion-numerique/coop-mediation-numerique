import { describe, expect, it } from 'vitest'
import { ProfilDuMediateur, profilDuMediateur } from './profil-du-mediateur'

describe('profil d’un médiateur du lieu', () => {
  it.each<[boolean, boolean, ProfilDuMediateur]>([
    [false, false, ProfilDuMediateur('Mediateur')],
    [false, true, ProfilDuMediateur('ConseillerNumerique')],
    [true, false, ProfilDuMediateur('CoordinateurHorsDispositif')],
    [true, true, ProfilDuMediateur('CoordinateurConseillerNumerique')],
  ])(
    'coordinateur %s, conseiller numérique %s : %s',
    (estCoordinateur, estConseillerNumerique, attendu) => {
      expect(
        profilDuMediateur({ estCoordinateur, estConseillerNumerique }),
      ).toBe(attendu)
    },
  )
})

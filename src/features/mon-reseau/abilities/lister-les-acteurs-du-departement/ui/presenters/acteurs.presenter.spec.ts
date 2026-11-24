import { describe, expect, it } from 'vitest'
import { Dispositif } from '../../../../domain'
import {
  coordinateurConseillerNumerique,
  mediateurHorsDispositif,
} from '../../../../fixtures/domaine'
import { groupesDActeurs, libelleDesResultats } from './acteurs.presenter'

const coordinateurHorsDispositif = {
  ...coordinateurConseillerNumerique,
  profil: {
    ...coordinateurConseillerNumerique.profil,
    dispositif: Dispositif('HorsDispositif'),
  },
}

describe('présentation de l’annuaire des acteurs', () => {
  it('range les coordinateurs selon le dispositif, puis les médiateurs', () => {
    expect(
      groupesDActeurs([
        mediateurHorsDispositif,
        coordinateurHorsDispositif,
        coordinateurConseillerNumerique,
      ]),
    ).toEqual({
      coordinateursDuDispositif: [coordinateurConseillerNumerique],
      coordinateursHorsDispositif: [coordinateurHorsDispositif],
      autres: [mediateurHorsDispositif],
    })
  })

  it.each([
    [0, false, 'Aucun acteur référencé'],
    [0, true, 'Aucun acteur ne correspond à votre recherche'],
    [1, false, '1 acteur référencé'],
    [12, true, '12 acteurs référencés'],
  ])('annonce %i résultat(s), filtré : %s', (total, filtre, attendu) => {
    expect(libelleDesResultats(total, filtre)).toBe(attendu)
  })
})

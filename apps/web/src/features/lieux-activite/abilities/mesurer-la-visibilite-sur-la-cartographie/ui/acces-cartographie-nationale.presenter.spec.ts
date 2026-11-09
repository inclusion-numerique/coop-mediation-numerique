import {
  compteAffiche,
  lieuxDuDepartementAffiches,
} from './acces-cartographie-nationale.presenter'

describe('les comptes de lieux visibles sur la cartographie', () => {
  it.each([
    [0, 'Aucun', 'n’est visible sur la cartographie.'],
    [1, '1', 'est visible sur la cartographie.'],
    [4, '4', 'sont visibles sur la cartographie.'],
  ])('%i lieu(x)', (compte, nombre, phrase) => {
    expect(compteAffiche(compte)).toEqual({ nombre, phrase })
  })

  it.each([
    [0, 'lieu d’activité de votre département'],
    [1, 'lieu d’activité de votre département'],
    [2, 'lieux d’activité de votre département'],
  ])('%i lieu(x) du département', (compte, attendu) => {
    expect(lieuxDuDepartementAffiches(compte)).toBe(attendu)
  })
})

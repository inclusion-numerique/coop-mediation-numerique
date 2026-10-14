import { adhesionActive, adhesionArchivee } from '../domain/fixtures'
import { fromAdhesion, toAdhesion } from './adhesion.transfer'

describe('transfert d’une adhésion', () => {
  it.each([
    ['active', adhesionActive],
    ['archivée', adhesionArchivee],
  ])('fait l’aller-retour : %s', (_, adhesion) => {
    expect(toAdhesion(fromAdhesion(adhesion))).toEqual(adhesion)
  })
})

import { CoordinateurId } from './coordinateur-id'
import { Dispositif } from './dispositif'
import { mediation } from './fixtures'
import { profilAffiche } from './profil-affiche'

const coordinateurId = CoordinateurId('a1b2c3d4-0000-4000-8000-000000000009')

describe('profil affiché', () => {
  it.each([
    ['ConseillerNumerique', 'ConseillerNumerique'],
    ['HorsDispositif', 'Mediateur'],
  ] as const)('un médiateur %s se montre %s', (dispositif, attendu) => {
    expect(
      profilAffiche({
        _tag: 'Mediateur',
        dispositif: Dispositif(dispositif),
        mediation,
      }),
    ).toBe(attendu)
  })

  it.each([
    ['ConseillerNumerique', 'CoordinateurConseillerNumerique'],
    ['HorsDispositif', 'CoordinateurHorsDispositif'],
  ] as const)(
    'un coordinateur %s se montre %s, même s’il fait de la médiation',
    (dispositif, attendu) => {
      expect(
        profilAffiche({
          _tag: 'Coordinateur',
          dispositif: Dispositif(dispositif),
          coordinateurId,
          mediation,
        }),
      ).toBe(attendu)
    },
  )
})

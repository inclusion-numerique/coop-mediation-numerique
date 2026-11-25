import { describe, expect, it } from 'vitest'
import { CodeDepartement } from '@/libraries/insee'
import { NomAffiche } from '@/libraries/nom-affiche'
import type { Mediation } from './acteur'
import { ActeurId } from './acteur-id'
import { CoordinateurId } from './coordinateur-id'
import { Dispositif } from './dispositif'
import { Effectif } from './effectif'
import { MediateurId } from './mediateur-id'
import { profilAffiche } from './profil-affiche'

const mediation: Mediation = {
  mediateurId: MediateurId('a1b2c3d4-0000-4000-8000-000000000001'),
  nombreDeLieux: Effectif(2),
  coordinateurs: [
    {
      acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000002'),
      nomAffiche: NomAffiche('Alex Durand'),
      departement: CodeDepartement('15'),
    },
  ],
}

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

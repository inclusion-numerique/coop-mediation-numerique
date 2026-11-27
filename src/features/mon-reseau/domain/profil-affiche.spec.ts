import { describe, expect, it } from 'vitest'
import { CodeInsee } from '@/libraries/insee'
import { NomAffiche } from '@/libraries/nom-affiche'
import type { Mediation } from './acteur'
import { ActeurId } from './acteur-id'
import { CoordinateurId } from './coordinateur-id'
import { Dispositif } from './dispositif'
import { Effectif } from './effectif'
import { MediateurId } from './mediateur-id'
import { ProfilAffiche, profilAffiche } from './profil-affiche'

const mediation: Mediation = {
  mediateurId: MediateurId('a1b2c3d4-0000-4000-8000-000000000001'),
  nombreDeLieux: Effectif(2),
  coordinateurs: [
    {
      acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000002'),
      nomAffiche: NomAffiche('Alex Durand'),
      communeDeLEmployeuse: CodeInsee('15014'),
    },
  ],
}

const coordinateurId = CoordinateurId('a1b2c3d4-0000-4000-8000-000000000009')

describe('profil affiché', () => {
  it.each<[Dispositif, ProfilAffiche]>([
    [Dispositif('ConseillerNumerique'), ProfilAffiche('ConseillerNumerique')],
    [Dispositif('HorsDispositif'), ProfilAffiche('Mediateur')],
  ])('un médiateur %s se montre %s', (dispositif, attendu) => {
    expect(
      profilAffiche({
        _tag: 'Mediateur',
        dispositif,
        mediation,
      }),
    ).toBe(attendu)
  })

  it.each<[Dispositif, ProfilAffiche]>([
    [
      Dispositif('ConseillerNumerique'),
      ProfilAffiche('CoordinateurConseillerNumerique'),
    ],
    [Dispositif('HorsDispositif'), ProfilAffiche('CoordinateurHorsDispositif')],
  ])(
    'un coordinateur %s se montre %s, même s’il fait de la médiation',
    (dispositif, attendu) => {
      expect(
        profilAffiche({
          _tag: 'Coordinateur',
          dispositif,
          coordinateurId,
          mediation,
        }),
      ).toBe(attendu)
    },
  )
})

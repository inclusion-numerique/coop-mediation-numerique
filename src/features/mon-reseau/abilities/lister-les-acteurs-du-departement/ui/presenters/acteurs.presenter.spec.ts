import { describe, expect, it } from 'vitest'
import { CodeDepartement } from '@/libraries/insee'
import { NomAffiche } from '@/libraries/nom-affiche'
import {
  type Acteur,
  ActeurId,
  CoordinateurId,
  Courriel,
  Dispositif,
  Effectif,
  MediateurId,
  type Mediation,
} from '../../../../domain'
import { groupesDActeurs, libelleDesResultats } from './acteurs.presenter'

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

const mediateurHorsDispositif: Acteur = {
  acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000003'),
  nomAffiche: NomAffiche('Camille Martin'),
  courriel: Courriel('camille.martin@example.org'),
  profil: {
    _tag: 'Mediateur',
    dispositif: Dispositif('HorsDispositif'),
    mediation,
  },
}

const coordinateurConseillerNumerique: Acteur = {
  acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000004'),
  nomAffiche: NomAffiche('Sacha Bernard'),
  courriel: Courriel('sacha.bernard@example.org'),
  profil: {
    _tag: 'Coordinateur',
    dispositif: Dispositif('ConseillerNumerique'),
    coordinateurId: CoordinateurId('a1b2c3d4-0000-4000-8000-000000000005'),
    mediation: null,
  },
}

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

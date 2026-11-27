import { describe, expect, it } from 'vitest'
import { CodeInsee } from '@/libraries/insee'
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
} from '../../domain'
import {
  iconeDuProfil,
  libelleDesLieux,
  libelleDuProfil,
} from './profil.presenter'

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

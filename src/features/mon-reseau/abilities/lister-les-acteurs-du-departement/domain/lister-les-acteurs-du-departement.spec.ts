import { Page, PageSize, Search, Sort } from '@arckit/resultset'
import { describe, expect, it } from 'vitest'
import { type Departement, NomDepartement } from '@/libraries/departement'
import { CodeDepartement, CodeInsee } from '@/libraries/insee'
import { NomAffiche } from '@/libraries/nom-affiche'
import {
  type Acteur,
  type ActeurAvecCommunes,
  ActeurId,
  Courriel,
  Dispositif,
  Effectif,
  MediateurId,
} from '../../../domain'
import type { CriteresActeurs } from './criteres-acteurs'
import { listerLesActeursDuDepartement } from './lister-les-acteurs-du-departement'

const criteres: CriteresActeurs = {
  recherche: Search(''),
  role: null,
  communes: [],
  tri: Sort('nom', 'asc'),
  page: Page(1),
  pageSize: PageSize(20),
}

const aucunActeur = {
  items: [],
  totalItems: 0,
  currentPage: Page(1),
  pageSize: PageSize(20),
}

const identite = {
  acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000003'),
  nomAffiche: NomAffiche('Camille Martin'),
  courriel: Courriel('camille.martin@example.org'),
}

const coordinateur = {
  acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000002'),
  nomAffiche: NomAffiche('Alex Durand'),
}

const mediation = {
  mediateurId: MediateurId('a1b2c3d4-0000-4000-8000-000000000001'),
  nombreDeLieux: Effectif(2),
}

const lu: ActeurAvecCommunes = {
  ...identite,
  profil: {
    _tag: 'Mediateur',
    dispositif: Dispositif('HorsDispositif'),
    mediation: {
      ...mediation,
      coordinateurs: [
        { ...coordinateur, communeDeLEmployeuse: CodeInsee('15014') },
      ],
    },
  },
}

const situe: Acteur = {
  ...identite,
  profil: {
    _tag: 'Mediateur',
    dispositif: Dispositif('HorsDispositif'),
    mediation: {
      ...mediation,
      coordinateurs: [{ ...coordinateur, departement: CodeDepartement('15') }],
    },
  },
}

const cantal: Departement = {
  code: CodeDepartement('15'),
  nom: NomDepartement('Cantal'),
}

const lister = listerLesActeursDuDepartement({
  acteursDuDepartement: async () => aucunActeur,
  communesDesLieux: async () => [{ value: '15014', label: 'Aurillac' }],
})

describe('lister les acteurs du département', () => {
  it('présente les acteurs du département avec les communes de leurs lieux', async () => {
    expect(await lister({ departement: cantal, criteres })).toEqual({
      success: true,
      data: {
        departement: cantal,
        criteres,
        acteurs: aucunActeur,
        communes: [{ value: '15014', label: 'Aurillac' }],
      },
    })
  })

  it('refuse un département inconnu', async () => {
    expect(await lister({ departement: null, criteres })).toEqual({
      success: false,
      error: { _tag: 'DepartementInconnu' },
    })
  })

  it('situe les coordinateurs de chaque acteur dans le département de leur employeuse', async () => {
    expect(
      await listerLesActeursDuDepartement({
        acteursDuDepartement: async () => ({ ...aucunActeur, items: [lu] }),
        communesDesLieux: async () => [],
      })({ departement: cantal, criteres }),
    ).toEqual({
      success: true,
      data: {
        departement: cantal,
        criteres,
        acteurs: { ...aucunActeur, items: [situe] },
        communes: [],
      },
    })
  })
})

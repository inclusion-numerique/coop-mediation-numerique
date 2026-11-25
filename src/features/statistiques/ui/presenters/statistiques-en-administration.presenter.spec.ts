import { describe, expect, it } from 'vitest'
import {
  adresseDExport,
  adressesDesExports,
  debutDuFiltreDePeriode,
  groupesDesStatistiques,
  periodeChoisieDans,
  periodeDActivite,
  titreDesStatistiques,
} from './statistiques-en-administration.presenter'

describe('statistiques en administration', () => {
  it('nomme la période d’activité', () => {
    expect(periodeDActivite('2022-03-15', '2024-10-30')).toBe(
      'Du 15/03/2022 au 30/10/2024',
    )
  })

  it('signale l’absence d’activité', () => {
    expect(periodeDActivite(null, null)).toBe('Aucune activité enregistrée')
  })

  it('reporte la période choisie dans l’adresse d’export', () => {
    expect(
      adresseDExport('/export/statistiques', {
        du: '2023-01-01',
        au: '2023-12-31',
      }),
    ).toBe('/export/statistiques?du=2023-01-01&au=2023-12-31')
  })

  it('exporte toute la période sans période choisie', () => {
    expect(adresseDExport('/export/statistiques', {})).toBe(
      '/export/statistiques',
    )
  })

  it('lit la période choisie et écarte une date invalide', () => {
    expect(
      periodeChoisieDans({ du: '2023-01-01', au: 'demain', recherche: 'x' }),
    ).toEqual({ du: '2023-01-01' })
  })

  it('précise que les statistiques d’un coordinateur comprennent son équipe', () => {
    expect(titreDesStatistiques({ coordinateur: true })).toBe(
      'Statistiques, équipe comprise',
    )
  })

  it('titre simplement les statistiques d’un médiateur', () => {
    expect(titreDesStatistiques({ coordinateur: false })).toBe('Statistiques')
  })

  it('place les exports sous la fiche de l’utilisateur', () => {
    expect(adressesDesExports('42')).toEqual({
      statistiques: '/administration/utilisateurs/42/export/statistiques',
      accompagnements: '/administration/utilisateurs/42/export/accompagnements',
    })
  })

  it('borne le filtre de période à la première activité', () => {
    expect(debutDuFiltreDePeriode('2022-03-15')).toEqual(new Date('2022-03-15'))
  })

  it('laisse le filtre de période ouvert sans activité', () => {
    expect(debutDuFiltreDePeriode(null)).toBeUndefined()
  })
})

const part = (label: string, count: number, proportion: number) => ({
  label,
  count,
  proportion,
})

const statistiques = {
  totaux: {
    activites: {
      total: 1107,
      individuels: { total: 1040, proportion: 94 },
      collectifs: { total: 67, proportion: 6, participants: 372 },
    },
    accompagnements: {
      total: 1412,
      individuels: { total: 1040, proportion: 74 },
      collectifs: { total: 372, proportion: 26 },
    },
    beneficiaires: { total: 980, nouveaux: 0, suivis: 120, anonymes: 860 },
  },
  repartition: {
    typeActivites: [part('Individuel', 1040, 94), part('Collectif', 67, 6)],
    durees: [part('Moins de 30 min', 10, 100)],
    typeLieu: [part('À distance', 3, 100)],
    thematiques: [
      part('E-mail', 2, 20),
      part('Banque', 0, 0),
      part('Diagnostic', 8, 80),
    ],
    thematiquesDemarches: [],
    materiels: [part('Ordinateur', 5, 100)],
  },
  profil: {
    genres: [part('Féminin', 6, 60), part('Masculin', 4, 40)],
    trancheAges: [part('18 - 24 ans', 1, 100)],
    statutsSocial: [part('Retraité', 1, 100)],
  },
  lieux: [part('Médiathèque', 3, 30), part('Mairie', 7, 70)],
  coordination: null,
}

describe('groupes des statistiques en administration', () => {
  it('écrit chaque total avec sa part', () => {
    expect(groupesDesStatistiques({ ...statistiques, periode: {} })[1]).toEqual(
      {
        titre: 'Accompagnements',
        lignes: [
          { libelle: 'Total', valeur: '1\u202f412' },
          { libelle: 'Individuels', valeur: '1\u202f040 (74 %)' },
          { libelle: 'Collectifs', valeur: '372 (26 %)' },
        ],
      },
    )
  })

  it('ne donne pas de nouveaux bénéficiaires sans période bornée', () => {
    expect(
      groupesDesStatistiques({ ...statistiques, periode: { du: '2024-01-01' } })
        .find(({ titre }) => titre === 'Bénéficiaires')
        ?.lignes.at(-1),
    ).toEqual({
      libelle: 'Nouveaux',
      valeur: 'Sur une période choisie seulement',
    })
  })

  it('trie les thématiques par nombre et écarte celles à zéro', () => {
    expect(
      groupesDesStatistiques({ ...statistiques, periode: {} }).find(
        ({ titre }) => titre === 'Thématiques',
      )?.lignes,
    ).toEqual([
      { libelle: 'Diagnostic', valeur: '8 (80 %)' },
      { libelle: 'E-mail', valeur: '2 (20 %)' },
    ])
  })

  it('signale une répartition vide', () => {
    expect(
      groupesDesStatistiques({ ...statistiques, periode: {} }).find(
        ({ titre }) => titre === 'Démarches administratives',
      )?.lignes,
    ).toEqual([{ libelle: 'Aucune', valeur: '0' }])
  })

  it('n’ajoute la coordination qu’à un coordinateur', () => {
    expect(
      groupesDesStatistiques({ ...statistiques, periode: {} }).some(
        ({ titre }) => titre.startsWith('Activités de coordination'),
      ),
    ).toBe(false)
  })

  it('compte les activités de coordination en cumul', () => {
    expect(
      groupesDesStatistiques({
        ...statistiques,
        coordination: [{ libelle: 'Réunion', nombre: 4 }],
        periode: {},
      }).at(-1),
    ).toEqual({
      titre: 'Activités de coordination, sur toute la période d’activité',
      lignes: [{ libelle: 'Réunion', valeur: '4' }],
    })
  })

  it('arrondit les parts à l’entier', () => {
    expect(
      groupesDesStatistiques({
        ...statistiques,
        repartition: {
          ...statistiques.repartition,
          thematiques: [part('Bureautique', 2, 66.667)],
        },
        periode: {},
      }).find(({ titre }) => titre === 'Thématiques')?.lignes,
    ).toEqual([{ libelle: 'Bureautique', valeur: '2 (67 %)' }])
  })
})

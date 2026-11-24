import { describe, expect, it } from 'vitest'
import {
  type StatistiquesFourniesAExposer,
  statistiquesAttributes,
  statistiquesExposees,
} from './statistiques-exposees.transfer'

const part = (value: string, count: number, proportion: number) => ({
  value,
  label: value,
  count,
  proportion,
})

const fournies: StatistiquesFourniesAExposer = {
  accompagnementsParJour: [{ label: '24/11', count: 3 }],
  accompagnementsParMois: [{ label: 'Nov.', count: 12 }],
  beneficiaires: {
    total: 8,
    genres: [part('Feminin', 5, 62.5)],
    trancheAges: [part('VingtCinqTrenteNeuf', 4, 50)],
    statutsSocial: [part('EnEmploi', 2, 25)],
  },
  activites: {
    total: 10,
    typeActivites: [part('Individuel', 7, 70)],
    durees: [part('30', 6, 60)],
    typeLieu: [part('LieuActivite', 9, 90)],
    thematiques: [part('Email', 3, 30)],
    thematiquesDemarches: [part('Logement', 1, 10)],
    materiels: [part('Ordinateur', 4, 40)],
  },
  totalCounts: {
    activites: {
      total: 10,
      individuels: { total: 7, proportion: 70 },
      collectifs: { total: 3, proportion: 30, participants: 15 },
    },
    accompagnements: {
      total: 22,
      individuels: { total: 7, proportion: 31.8 },
      collectifs: { total: 15, proportion: 68.2 },
    },
    beneficiaires: { total: 8, nouveaux: 2, suivis: 5, anonymes: 3 },
  },
}

describe('statistiques exposées par l’API', () => {
  it('expose les statistiques fournies, sans tags, et leurs totaux', () => {
    expect(statistiquesExposees(fournies)).toEqual({
      accompagnementsParJour: [{ label: '24/11', count: 3 }],
      accompagnementsParMois: [{ label: 'Nov.', count: 12 }],
      beneficiaires: {
        total: 8,
        genres: [part('Feminin', 5, 62.5)],
        trancheAges: [part('VingtCinqTrenteNeuf', 4, 50)],
        statutsSocial: [part('EnEmploi', 2, 25)],
      },
      activites: {
        total: 10,
        typeActivites: [part('Individuel', 7, 70)],
        durees: [part('30', 6, 60)],
        typeLieu: [part('LieuActivite', 9, 90)],
        thematiques: [part('Email', 3, 30)],
        thematiquesDemarches: [part('Logement', 1, 10)],
        materiels: [part('Ordinateur', 4, 40)],
        tags: [],
      },
      totaux: {
        activites: {
          total: 10,
          individuels: { total: 7, proportion: 70 },
          collectifs: { total: 3, proportion: 30, participants: 15 },
        },
        accompagnements: {
          total: 22,
          individuels: { total: 7, proportion: 31.8 },
          collectifs: { total: 15, proportion: 68.2 },
        },
        beneficiaires: { total: 8, nouveaux: 2, suivis: 5, anonymes: 3 },
      },
    })
  })

  it('met les clés des attributs en snake case, valeurs comprises', () => {
    expect(statistiquesAttributes(statistiquesExposees(fournies))).toEqual({
      accompagnements_par_jour: [{ label: '24/11', count: 3 }],
      accompagnements_par_mois: [{ label: 'Nov.', count: 12 }],
      beneficiaires: {
        total: 8,
        genres: [part('Feminin', 5, 62.5)],
        tranche_ages: [part('VingtCinqTrenteNeuf', 4, 50)],
        statuts_social: [part('EnEmploi', 2, 25)],
      },
      activites: {
        total: 10,
        type_activites: [part('Individuel', 7, 70)],
        durees: [part('30', 6, 60)],
        type_lieu: [part('LieuActivite', 9, 90)],
        thematiques: [part('Email', 3, 30)],
        thematiques_demarches: [part('Logement', 1, 10)],
        materiels: [part('Ordinateur', 4, 40)],
        tags: [],
      },
      totaux: {
        activites: {
          total: 10,
          individuels: { total: 7, proportion: 70 },
          collectifs: { total: 3, proportion: 30, participants: 15 },
        },
        accompagnements: {
          total: 22,
          individuels: { total: 7, proportion: 31.8 },
          collectifs: { total: 15, proportion: 68.2 },
        },
        beneficiaires: { total: 8, nouveaux: 2, suivis: 5, anonymes: 3 },
      },
    })
  })
})

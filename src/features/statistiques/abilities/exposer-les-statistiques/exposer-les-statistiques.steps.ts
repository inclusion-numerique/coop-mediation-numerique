import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { FiltresDesStatistiquesValidation } from './implementations/api/filtres-des-statistiques.params'
import type { StatistiquesFourniesAExposer } from './implementations/api/statistiques-exposees.transfer'
import {
  type StatistiquesExposees,
  statistiquesExposees,
} from './implementations/api/statistiques-exposees.transfer'

const calcul: {
  fournies?: StatistiquesFourniesAExposer
  statistiques?: StatistiquesExposees
  filtreValide?: boolean
} = {}

const aucunePart = { total: 0, proportion: 0 }

Given(
  'des statistiques fournies qui comptent {int} activités',
  (total: number) => {
    calcul.fournies = {
      accompagnementsParJour: [],
      accompagnementsParMois: [],
      beneficiaires: {
        total: 0,
        genres: [],
        trancheAges: [],
        statutsSocial: [],
      },
      activites: {
        total,
        typeActivites: [],
        durees: [],
        typeLieu: [],
        thematiques: [],
        thematiquesDemarches: [],
        materiels: [],
      },
      totalCounts: {
        activites: {
          total,
          individuels: aucunePart,
          collectifs: { ...aucunePart, participants: 0 },
        },
        accompagnements: {
          total: 0,
          individuels: aucunePart,
          collectifs: aucunePart,
        },
        beneficiaires: { total: 0, nouveaux: 0, suivis: 0, anonymes: 0 },
      },
    }
  },
)

When("l'API expose ces statistiques", () => {
  assert.ok(calcul.fournies, 'Aucune statistique fournie')
  calcul.statistiques = statistiquesExposees(calcul.fournies)
})

When("l'API reçoit le filtre de types {string}", (types: string) => {
  calcul.filtreValide = FiltresDesStatistiquesValidation.safeParse({
    types,
  }).success
})

Then('les statistiques comptent {int} activités', (attendu: number) => {
  assert.ok(calcul.statistiques, 'Aucune statistique calculée')
  assert.strictEqual(calcul.statistiques.totaux.activites.total, attendu)
})

Then('le filtre est refusé', () => {
  assert.strictEqual(calcul.filtreValide, false)
})

When(
  "l'API reçoit le filtre de statuts de rendez-vous {string}",
  (rdvs: string) => {
    calcul.filtreValide = FiltresDesStatistiquesValidation.safeParse({
      rdvs,
    }).success
  },
)

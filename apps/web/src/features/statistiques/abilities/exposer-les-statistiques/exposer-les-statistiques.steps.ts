import assert from 'node:assert'
import {
  comptesRendusSemes,
  semerComptesRendus,
} from '@app/web/features/activites/activites.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'
import {
  FiltresDesStatistiquesValidation,
  type StatistiquesExposees,
  statistiquesExposees,
} from './implementation'

const calcul: {
  statistiques?: StatistiquesExposees
  filtreValide?: boolean
} = {}

Given('des activités à compter dans les statistiques', async () => {
  await semerComptesRendus()
})

When("l'API calcule les statistiques de leur médiateur", async () => {
  calcul.statistiques = await statistiquesExposees(
    FiltresDesStatistiquesValidation.parse({
      mediateurs: comptesRendusSemes().mediateurId,
    }),
  )
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

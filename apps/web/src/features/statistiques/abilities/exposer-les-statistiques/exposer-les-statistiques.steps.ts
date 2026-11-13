import assert from 'node:assert'
import { fenetreDe } from '@app/web/features/activites/abilities/compter-les-accompagnements-par-periode'
import {
  comptesRendusSemes,
  semerComptesRendus,
} from '@app/web/features/activites/activites.cucumber'
import {
  criteresDesStatistiques,
  Jour,
  PERIMETRE_NATIONAL,
} from '@app/web/features/activites/domain'
import { statistiquesFournies } from '@app/web/features/activites/ui/statistiques/statistiques-fournies'
import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import { rendezVousAuxStatutsSql } from '@app/web/features/rdvsp/abilities/lister-les-rdvs-des-activites'
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
  const criteres = criteresDesStatistiques(
    FiltresDesStatistiquesValidation.parse({
      mediateurs: comptesRendusSemes().mediateurId,
    }),
  )
  const fenetre = fenetreDe({ debut: null, fin: Jour('2026-06-30') })
  calcul.statistiques = statistiquesExposees(
    await statistiquesFournies(
      {
        perimetre: PERIMETRE_NATIONAL,
        criteres,
        conseillersNumeriques: conseillerNumeriqueSql,
        rendezVousAuxStatuts: rendezVousAuxStatutsSql,
        parJour: fenetre,
        parMois: fenetre,
      },
      { territoires: false, tags: false },
    ),
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

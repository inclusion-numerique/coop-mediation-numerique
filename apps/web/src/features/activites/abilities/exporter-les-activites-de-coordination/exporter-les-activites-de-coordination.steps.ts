import assert from 'node:assert'
import {
  exporterLesActivitesDeCoordination,
  tagsDesCriteres,
} from '@app/web/features/activites/abilities/exporter-les-activites-de-coordination'
import { coordinationsSemees } from '@app/web/features/activites/activites.cucumber'
import {
  type ActiviteDeCoordination,
  CoordinateurId,
  criteresDesCoordinations,
  type ParametresDesCoordinations,
  type TagDeLActivite,
} from '@app/web/features/activites/domain'
import { Then, When } from '@cucumber/cucumber'

let exportees: readonly ActiviteDeCoordination[] = []
let tagsRappeles: readonly TagDeLActivite[] = []

const exporter = async (parametres: ParametresDesCoordinations) => {
  const criteres = criteresDesCoordinations(parametres)
  const [activites, tags] = await Promise.all([
    exporterLesActivitesDeCoordination({
      coordinateurId: CoordinateurId(coordinationsSemees().coordinateurId),
      criteres,
    }),
    tagsDesCriteres(criteres),
  ])
  exportees = activites
  tagsRappeles = tags
}

When("j'exporte mes activités de coordination", async () => {
  await exporter({})
})

When("j'exporte mes activités de coordination taguées « Réseau »", async () => {
  await exporter({ tags: coordinationsSemees().tags.reseau })
})

Then('{int} activités de coordination sont exportées', (attendu: number) => {
  assert.strictEqual(exportees.length, attendu)
})

Then("le tag « Réseau » est rappelé dans les filtres de l'export", () => {
  assert.deepStrictEqual(
    tagsRappeles.map(({ id }) => id),
    [coordinationsSemees().tags.reseau],
  )
})

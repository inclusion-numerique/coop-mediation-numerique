import assert from 'node:assert'
import {
  exporterLesActivitesDeCoordination,
  tagsRappeles,
} from '@app/web/features/activites/abilities/exporter-les-activites-de-coordination'
import { coordinationsSemees } from '@app/web/features/activites/activites.cucumber'
import {
  type ActiviteDeCoordination,
  CoordinateurId,
  criteresDesCoordinations,
  NomDeTag,
  type ParametresDesCoordinations,
  type TagDeLActivite,
  TagId,
  type TagsUtilisables,
} from '@app/web/features/activites/domain'
import { prismaClient } from '@app/web/prismaClient'
import { Then, When } from '@cucumber/cucumber'

let exportees: readonly ActiviteDeCoordination[] = []
let rappeles: readonly TagDeLActivite[] = []

const tagsEnBase: TagsUtilisables = async (tagIds) =>
  (
    await prismaClient.tag.findMany({
      where: { id: { in: [...tagIds] } },
      select: { id: true, nom: true },
    })
  ).map(({ id, nom }) => ({ id: TagId(id), nom: NomDeTag(nom) }))

const exporter = async (parametres: ParametresDesCoordinations) => {
  const criteres = criteresDesCoordinations(parametres)
  const [activites, tags] = await Promise.all([
    exporterLesActivitesDeCoordination({
      coordinateurId: CoordinateurId(coordinationsSemees().coordinateurId),
      criteres,
    }),
    tagsRappeles({ criteres, tagsUtilisables: tagsEnBase }),
  ])
  exportees = activites
  rappeles = tags
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
    rappeles.map(({ id }) => id),
    [coordinationsSemees().tags.reseau],
  )
})

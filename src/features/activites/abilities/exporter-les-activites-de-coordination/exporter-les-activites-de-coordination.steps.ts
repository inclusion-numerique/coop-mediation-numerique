import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import { tagsRappeles } from '@/features/activites/abilities/exporter-les-activites-de-coordination/domain/tags-rappeles'
import { exporterLesActivitesDeCoordination } from '@/features/activites/abilities/exporter-les-activites-de-coordination/implementations/prisma/activites-a-exporter.query'
import { coordinationsSemees } from '@/features/activites/activites.cucumber'
import {
  type ActiviteDeCoordination,
  CoordinateurId,
  NomDeTag,
  type TagDeLActivite,
  TagId,
  type TagsUtilisables,
} from '@/features/activites/domain'
import { criteresDesCoordinationsDepuisLURL } from '@/features/activites/fixtures/criteres-depuis-l-url'

let exportees: readonly ActiviteDeCoordination[] = []
let rappeles: readonly TagDeLActivite[] = []

const tagsEnBase: TagsUtilisables = async (tagIds) =>
  (
    await prismaClient.tag.findMany({
      where: { id: { in: [...tagIds] } },
      select: { id: true, nom: true },
    })
  ).map(({ id, nom }) => ({ id: TagId(id), nom: NomDeTag(nom) }))

const exporter = async (
  parametres: Parameters<typeof criteresDesCoordinationsDepuisLURL>[0],
) => {
  const criteres = criteresDesCoordinationsDepuisLURL(parametres)
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

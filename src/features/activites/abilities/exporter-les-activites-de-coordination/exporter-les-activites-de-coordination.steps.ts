import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { exporterLesActivitesDeCoordination } from '@/features/activites/abilities/exporter-les-activites-de-coordination/domain/exporter-les-activites-de-coordination'
import { activitesAExporter } from '@/features/activites/abilities/exporter-les-activites-de-coordination/implementations/prisma/activites-a-exporter.query'
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

const etat: {
  exportees: readonly ActiviteDeCoordination[]
  rappeles: readonly TagDeLActivite[]
} = {
  exportees: [],
  rappeles: [],
}

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
  const exportation = await exporterLesActivitesDeCoordination({
    activitesAExporter,
    tagsUtilisables: tagsEnBase,
  })({
    coordinateurId: CoordinateurId(coordinationsSemees().coordinateurId),
    criteres,
  })
  const { activites, tags } = exportation.data
  etat.exportees = activites
  etat.rappeles = tags
}

When("j'exporte mes activités de coordination", async () => {
  await exporter({})
})

When("j'exporte mes activités de coordination taguées « Réseau »", async () => {
  await exporter({ tags: coordinationsSemees().tags.reseau })
})

Then('{int} activités de coordination sont exportées', (attendu: number) => {
  assert.strictEqual(etat.exportees.length, attendu)
})

Then("le tag « Réseau » est rappelé dans les filtres de l'export", () => {
  assert.deepStrictEqual(
    etat.rappeles.map(({ id }) => id),
    [coordinationsSemees().tags.reseau],
  )
})

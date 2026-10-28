import assert from 'node:assert'
import {
  type EchecDeSuppression,
  supprimerUneActiviteDeCoordination,
} from '@app/web/features/activites/abilities/supprimer-une-activite-de-coordination'
import {
  ActiviteDeCoordinationId,
  CoordinateurId,
} from '@app/web/features/activites/domain'
import type { Result } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

type Semis = {
  readonly userIds: readonly string[]
  readonly coordinateurIds: readonly string[]
  readonly tagId: string
  readonly activiteId: string
}

let semis: Semis | undefined
let resultat: Result<void, EchecDeSuppression> | undefined

const semerUnCoordinateur = async () => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `suppression-${userId}@example.com` },
  })
  const { id } = await prismaClient.coordinateur.create({
    data: { userId },
    select: { id: true },
  })
  return { userId, coordinateurId: id }
}

const semisCourant = (): Semis => {
  if (!semis) throw new Error('Aucune activité semée')
  return semis
}

const supprimerPar = async (coordinateurId: string, userId: string) => {
  resultat = await supprimerUneActiviteDeCoordination({
    activiteId: ActiviteDeCoordinationId(semisCourant().activiteId),
    coordinateurId: CoordinateurId(coordinateurId),
    auteurId: userId,
  })
}

Given(
  'une activité de coordination taguée, enregistrée par un coordinateur',
  async () => {
    const auteur = await semerUnCoordinateur()
    const autre = await semerUnCoordinateur()
    const tag = await prismaClient.tag.create({
      data: { nom: `Tag ${v4()}`, coordinateurId: auteur.coordinateurId },
      select: { id: true },
    })
    const activite = await prismaClient.activiteCoordination.create({
      data: {
        coordinateurId: auteur.coordinateurId,
        type: 'Animation',
        date: new Date('2026-06-03'),
        tags: { create: { tagId: tag.id } },
      },
      select: { id: true },
    })
    semis = {
      userIds: [auteur.userId, autre.userId],
      coordinateurIds: [auteur.coordinateurId, autre.coordinateurId],
      tagId: tag.id,
      activiteId: activite.id,
    }
  },
)

When('le coordinateur supprime cette activité', async () => {
  const { coordinateurIds, userIds } = semisCourant()
  await supprimerPar(coordinateurIds[0], userIds[0])
})

When('un autre coordinateur supprime cette activité', async () => {
  const { coordinateurIds, userIds } = semisCourant()
  await supprimerPar(coordinateurIds[1], userIds[1])
})

Then("la suppression de l'activité réussit", () => {
  assert.strictEqual(resultat?.success, true)
})

Then("la suppression de l'activité échoue avec {string}", (attendu: string) => {
  assert.strictEqual(
    resultat?.success === false ? resultat.error._tag : null,
    attendu,
  )
})

const suppressionDeLActivite = async () =>
  (
    await prismaClient.activiteCoordination.findUniqueOrThrow({
      where: { id: semisCourant().activiteId },
      select: { suppression: true },
    })
  ).suppression

Then("l'activité est marquée supprimée", async () => {
  assert.notStrictEqual(await suppressionDeLActivite(), null)
})

Then("l'activité n'est pas marquée supprimée", async () => {
  assert.strictEqual(await suppressionDeLActivite(), null)
})

Then("l'activité n'a plus de tag", async () => {
  assert.strictEqual(
    await prismaClient.activitesCoordinationTags.count({
      where: { activiteCoordinationId: semisCourant().activiteId },
    }),
    0,
  )
})

After(async () => {
  const seme = semis
  semis = undefined
  resultat = undefined
  if (!seme) return

  await prismaClient.activitesCoordinationTags.deleteMany({
    where: { activiteCoordinationId: seme.activiteId },
  })
  await prismaClient.activiteCoordination.deleteMany({
    where: { id: seme.activiteId },
  })
  await prismaClient.tag.deleteMany({ where: { id: seme.tagId } })
  await prismaClient.coordinateur.deleteMany({
    where: { id: { in: [...seme.coordinateurIds] } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [...seme.userIds] } },
  })
})

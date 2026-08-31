import assert from 'node:assert'
import { libererDesEquipes } from '@app/web/features/equipe'
import {
  equipeSemee,
  semerTagDeCoordinateur,
  semerTagDeMediateur,
} from '@app/web/features/equipe/equipe.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

type Bilan = Awaited<ReturnType<typeof libererDesEquipes>>

let bilan: Bilan | undefined

/** Le porteur du scénario est toujours le premier médiateur semé. */
const porteur = () => equipeSemee().mediateurIds[0] as string
const utilisateurs = () => equipeSemee().mediateurIds.slice(1)

Given(
  'un coordinateur dont le tag est utilisé par {int} médiateurs',
  async (nombreUtilisateurs: number) => {
    await semerTagDeCoordinateur({ nombreUtilisateurs })
  },
)

Given(
  'un coordinateur dont le tag est utilisé par {int} médiateur',
  async (nombreUtilisateurs: number) => {
    await semerTagDeCoordinateur({ nombreUtilisateurs })
  },
)

Given('un médiateur coordonné par un seul coordinateur', async () => {
  await semerTagDeMediateur({ avecCoordinateur: true })
})

Given('un médiateur sans coordinateur', async () => {
  await semerTagDeMediateur({ avecCoordinateur: false })
})

When('je libère ce coordinateur de ses équipes', async () => {
  bilan = await libererDesEquipes({
    mediateurId: null,
    coordinateurId: equipeSemee().coordinateurId,
  })
})

When('je libère ce médiateur de ses équipes', async () => {
  bilan = await libererDesEquipes({
    mediateurId: porteur(),
    coordinateurId: null,
  })
})

Then('{int} tags sont essaimés', (attendu: number) => {
  assert.strictEqual(bilan?.tagsTransferes, attendu)
})

Then('{int} tag est essaimé', (attendu: number) => {
  assert.strictEqual(bilan?.tagsTransferes, attendu)
})

Then('{int} tag est transféré', (attendu: number) => {
  assert.strictEqual(bilan?.tagsTransferes, attendu)
})

Then('chaque médiateur utilisateur possède désormais le tag', async () => {
  const attendus = utilisateurs()

  const possedes = await prismaClient.tag.count({
    where: { mediateurId: { in: [...attendus] }, suppression: null },
  })

  assert.strictEqual(possedes, attendus.length)
})

Then('les comptes rendus pointent vers le tag de leur médiateur', async () => {
  const liens = await prismaClient.activitesTags.findMany({
    where: { activite: { mediateurId: { in: [...utilisateurs()] } } },
    select: { tag: { select: { mediateurId: true, coordinateurId: true } } },
  })

  assert.ok(liens.length > 0, 'Aucun compte rendu tagué')
  for (const { tag } of liens) {
    assert.ok(tag.mediateurId, 'Le tag devrait appartenir à un médiateur')
    assert.strictEqual(tag.coordinateurId, null)
  }
})

Then('le tag du coordinateur est marqué supprimé', async () => {
  const tag = await prismaClient.tag.findUniqueOrThrow({
    where: { id: equipeSemee().tagId },
    select: { suppression: true },
  })

  assert.ok(tag.suppression)
})

Then('le tag du médiateur est marqué supprimé', async () => {
  const tag = await prismaClient.tag.findUniqueOrThrow({
    where: { id: equipeSemee().tagId },
    select: { suppression: true },
  })

  assert.ok(tag.suppression)
})

Then('le tag appartient désormais au coordinateur', async () => {
  const tag = await prismaClient.tag.findUniqueOrThrow({
    where: { id: equipeSemee().tagId },
    select: { mediateurId: true, coordinateurId: true, suppression: true },
  })

  assert.strictEqual(tag.mediateurId, null)
  assert.strictEqual(tag.coordinateurId, equipeSemee().coordinateurId)
  assert.strictEqual(tag.suppression, null)
})

Then("ce médiateur n'appartient plus à aucune équipe", async () => {
  assert.strictEqual(
    await prismaClient.mediateurCoordonne.count({
      where: { mediateurId: porteur() },
    }),
    0,
  )
})

Then('les invitations de ce médiateur ont disparu', async () => {
  assert.strictEqual(
    await prismaClient.invitationEquipe.count({
      where: { mediateurId: porteur() },
    }),
    0,
  )
})

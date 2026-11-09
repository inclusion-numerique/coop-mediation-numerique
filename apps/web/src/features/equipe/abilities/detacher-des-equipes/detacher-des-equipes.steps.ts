import assert from 'node:assert'
import { detacherDesEquipes } from '@app/web/features/equipe'
import {
  equipeSemee,
  semerUnMediateurCoordonne,
} from '@app/web/features/equipe/equipe.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

const porteur = (): string => {
  const [mediateurId] = equipeSemee().mediateurIds
  assert.ok(mediateurId)
  return mediateurId
}

Given('un médiateur coordonné par un seul coordinateur', async () => {
  await semerUnMediateurCoordonne()
})

When('je détache ce médiateur de ses équipes', async () => {
  await detacherDesEquipes({
    mediateurId: porteur(),
    coordinateurId: null,
  })
})

Then("ce médiateur n'est plus membre actif d'aucune équipe", async () => {
  assert.strictEqual(
    await prismaClient.mediateurCoordonne.count({
      where: { mediateurId: porteur(), suppression: null },
    }),
    0,
  )
})

Then('ce médiateur reste ancien membre de son équipe', async () => {
  assert.strictEqual(
    await prismaClient.mediateurCoordonne.count({
      where: { mediateurId: porteur(), suppression: { not: null } },
    }),
    1,
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

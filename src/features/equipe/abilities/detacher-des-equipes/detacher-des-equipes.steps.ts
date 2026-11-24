import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import { detacherDesEquipes } from '@/features/equipe/abilities/detacher-des-equipes/implementations/prisma/detacher-des-equipes.mutation'
import {
  equipeSemee,
  semerUnMediateurCoordonne,
} from '@/features/equipe/equipe.cucumber'

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

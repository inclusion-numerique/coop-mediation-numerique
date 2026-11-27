import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { detacherDesEquipes as detacherDesEquipesAvec } from '@/features/equipe/abilities/detacher-des-equipes/domain/detacher-des-equipes'
import { retirerDesEquipes } from '@/features/equipe/abilities/detacher-des-equipes/implementations/prisma/retirer-des-equipes.mutation'
import { MediateurId } from '@/features/equipe/domain'
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
  await detacherDesEquipesAvec({ retirerDesEquipes })({
    compte: { _tag: 'Mediateur', mediateurId: MediateurId(porteur()) },
    maintenant: new Date(),
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

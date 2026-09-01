import assert from 'node:assert'
import { retirerDesLieux } from '@app/web/features/lieux-activite/abilities/retirer-des-lieux'
import {
  lieuxSemes,
  semerLieuxDActivite,
} from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

let retires: number | undefined

Given("un médiateur rattaché à deux lieux d'activité", async () => {
  await semerLieuxDActivite()
})

When('je retire ce médiateur de ses lieux', async () => {
  retires = (await retirerDesLieux({ mediateurId: lieuxSemes().mediateurId }))
    .rattachementsSupprimes
})

When('je retire à nouveau ce médiateur de ses lieux', async () => {
  retires = (await retirerDesLieux({ mediateurId: lieuxSemes().mediateurId }))
    .rattachementsSupprimes
})

Then('le retrait porte sur {int} rattachements', (attendu: number) => {
  assert.strictEqual(retires, attendu)
})

Then('le retrait porte sur {int} rattachement', (attendu: number) => {
  assert.strictEqual(retires, attendu)
})

Then("ce médiateur n'est plus rattaché à aucun lieu", async () => {
  assert.strictEqual(
    await prismaClient.mediateurEnActivite.count({
      where: { mediateurId: lieuxSemes().mediateurId },
    }),
    0,
  )
})

Then('les lieux eux-mêmes existent toujours', async () => {
  assert.strictEqual(
    await prismaClient.lieuInclusion.count({
      where: { id: { in: [...lieuxSemes().lieuIds] } },
    }),
    2,
  )
})

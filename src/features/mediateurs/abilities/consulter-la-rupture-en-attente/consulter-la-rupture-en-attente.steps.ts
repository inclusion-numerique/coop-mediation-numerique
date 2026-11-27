import assert from 'node:assert'
import { Then } from '@cucumber/cucumber'
import { consulterLaRuptureEnAttente } from '@/features/mediateurs/abilities/consulter-la-rupture-en-attente/domain/consulter-la-rupture-en-attente'
import { MediateurId } from '@/features/mediateurs/domain'
import { lireMediateurEtContrats } from '@/features/mediateurs/implementations/prisma/mediateur-et-contrats.query'
import { exConseillerSeme } from '@/features/mediateurs/mediateurs.cucumber'

const maintenant = new Date('2026-10-20T09:00:00.000Z')

const ruptureEnAttente = async (): Promise<boolean> =>
  (
    await consulterLaRuptureEnAttente({ lireMediateurEtContrats })({
      mediateurId: MediateurId(exConseillerSeme().mediateurId),
      maintenant,
    })
  ).success

Then('une réponse sur sa visibilité est attendue', async () => {
  assert.strictEqual(await ruptureEnAttente(), true)
})

Then("aucune réponse n'est attendue", async () => {
  assert.strictEqual(await ruptureEnAttente(), false)
})

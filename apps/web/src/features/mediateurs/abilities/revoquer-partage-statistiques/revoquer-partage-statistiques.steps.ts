import assert from 'node:assert'
import { revoquerPartageStatistiques } from '@app/web/features/mediateurs/abilities/revoquer-partage-statistiques'
import {
  partagesSemes,
  semerPartagesStatistiques,
} from '@app/web/features/mediateurs/mediateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

const revocation: { partagesRevoques?: number } = {}

const cible = () => ({
  mediateurId: partagesSemes().mediateurId,
  coordinateurId: partagesSemes().coordinateurId,
})

Given('un compte qui partage ses statistiques des deux côtés', async () => {
  await semerPartagesStatistiques()
})

When('je révoque le partage de statistiques de ce compte', async () => {
  revocation.partagesRevoques = (
    await revoquerPartageStatistiques(cible())
  ).partagesRevoques
})

When(
  'je révoque à nouveau le partage de statistiques de ce compte',
  async () => {
    revocation.partagesRevoques = (
      await revoquerPartageStatistiques(cible())
    ).partagesRevoques
  },
)

Then('la révocation porte sur {int} partages', (attendu: number) => {
  assert.strictEqual(revocation.partagesRevoques, attendu)
})

Then('la révocation porte sur {int} partage', (attendu: number) => {
  assert.strictEqual(revocation.partagesRevoques, attendu)
})

Then("plus aucun partage de ce compte n'est actif", async () => {
  const { mediateurId, coordinateurId } = cible()

  assert.strictEqual(
    await prismaClient.partageStatistiques.count({
      where: { deleted: null, OR: [{ mediateurId }, { coordinateurId }] },
    }),
    0,
  )
})

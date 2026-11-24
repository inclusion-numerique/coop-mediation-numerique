import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import { revoquerPartageStatistiques } from '@/features/mediateurs/abilities/revoquer-partage-statistiques/implementations/prisma/revoquer-partage-statistiques.mutation'
import { rattachementsSemes } from '@/features/mediateurs/mediateurs.cucumber'

const revocation: { partagesRevoques?: number } = {}

When('je révoque le partage de statistiques de ce compte', async () => {
  revocation.partagesRevoques = (
    await revoquerPartageStatistiques(rattachementsSemes())
  ).partagesRevoques
})

When(
  'je révoque à nouveau le partage de statistiques de ce compte',
  async () => {
    revocation.partagesRevoques = (
      await revoquerPartageStatistiques(rattachementsSemes())
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
  const { mediateurId, coordinateurId } = rattachementsSemes()

  assert.strictEqual(
    await prismaClient.partageStatistiques.count({
      where: { deleted: null, OR: [{ mediateurId }, { coordinateurId }] },
    }),
    0,
  )
})

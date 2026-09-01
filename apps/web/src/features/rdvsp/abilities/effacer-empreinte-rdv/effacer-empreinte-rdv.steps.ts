import assert from 'node:assert'
import { effacerEmpreinteRdv } from '@app/web/features/rdvsp/abilities/effacer-empreinte-rdv'
import {
  ID_TEST,
  seedAutreMediateur,
  seedBeneficiaire,
  seedCompteRdv,
  seedParticipationRdv,
  seedRdv,
  seedUsagerRdv,
  testUtilisateurId,
} from '@app/web/features/rdvsp/rdvsp.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

type Bilan = Awaited<ReturnType<typeof effacerEmpreinteRdv>>

let bilan: Bilan | undefined

Given('un compte RDV avec un rendez-vous et un usager', async () => {
  await seedCompteRdv({ id: ID_TEST.compte })
  await seedRdv({ id: ID_TEST.rdv, rdvAccountId: ID_TEST.compte })
  await seedUsagerRdv(ID_TEST.usager)
  await seedParticipationRdv({
    id: ID_TEST.participation,
    rdvId: ID_TEST.rdv,
    usagerId: ID_TEST.usager,
  })
})

Given(
  "cet usager est rattaché au bénéficiaire d'un autre médiateur",
  async () => {
    await seedBeneficiaire({
      mediateurId: await seedAutreMediateur(),
      rdvUserId: ID_TEST.usager,
    })
  },
)

When("j'efface l'empreinte RDV de ce compte", async () => {
  bilan = await effacerEmpreinteRdv({ utilisateurId: testUtilisateurId })
})

When("j'efface à nouveau l'empreinte RDV de ce compte", async () => {
  bilan = await effacerEmpreinteRdv({ utilisateurId: testUtilisateurId })
})

Then('le compte RDV est délié', () => {
  assert.strictEqual(bilan?.compteDelie, true)
})

Then("le compte RDV n'est pas délié", () => {
  assert.strictEqual(bilan?.compteDelie, false)
})

Then("l'effacement RDV porte sur {int} rendez-vous", (attendu: number) => {
  assert.strictEqual(bilan?.rdvsExpurges, attendu)
})

Then("l'effacement RDV supprime {int} usager", (attendu: number) => {
  assert.strictEqual(bilan?.usagersSupprimes, attendu)
})

Then("le compte RDV n'est plus en base", async () => {
  assert.strictEqual(
    await prismaClient.rdvAccount.count({ where: { id: ID_TEST.compte } }),
    0,
  )
})

Then("le rendez-vous n'est plus en base", async () => {
  assert.strictEqual(
    await prismaClient.rdv.count({ where: { id: ID_TEST.rdv } }),
    0,
  )
})

Then("l'usager RDV est toujours en base", async () => {
  assert.strictEqual(
    await prismaClient.rdvUser.count({ where: { id: ID_TEST.usager } }),
    1,
  )
})

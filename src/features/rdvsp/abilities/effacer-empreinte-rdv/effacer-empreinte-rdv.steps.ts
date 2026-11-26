import assert from 'node:assert'
import { Given, Then, When, type World } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import {
  type BilanDeLEffacement,
  bilanDeLEffacement,
} from '@/features/rdvsp/abilities/effacer-empreinte-rdv/domain/bilan-de-l-effacement'
import { effacerEmpreinteRdv } from '@/features/rdvsp/abilities/effacer-empreinte-rdv/domain/effacer-empreinte-rdv'
import {
  supprimerLeCompteRdv,
  supprimerLesUsagers,
} from '@/features/rdvsp/abilities/effacer-empreinte-rdv/implementations/prisma/effacer-empreinte-rdv.mutation'
import {
  compteAEffacer,
  rendezVousDuCompte,
  usagersOrphelinsParmi,
} from '@/features/rdvsp/abilities/effacer-empreinte-rdv/implementations/prisma/effacer-empreinte-rdv.query'
import type { JetonsOAuth } from '@/features/rdvsp/domain/compte/jetons-oauth'
import { ApiIndisponible } from '@/features/rdvsp/domain/errors'
import {
  ID_TEST,
  seedAutreMediateur,
  seedBeneficiaire,
  seedCompteRdv,
  seedParticipationRdv,
  seedRdv,
  seedUsagerRdv,
  testUtilisateurId,
} from '@/features/rdvsp/rdvsp.cucumber'
import { failure, success } from '@/libraries/result'

const rdvServicePublic: {
  disponible: boolean
  revocations: JetonsOAuth[]
} = { disponible: true, revocations: [] }

const effacer = effacerEmpreinteRdv({
  compteAEffacer,
  revoquerJetons: async (jetons) => {
    if (!rdvServicePublic.disponible) {
      return failure(ApiIndisponible(503, 'Service indisponible'))
    }
    rdvServicePublic.revocations.push(jetons)
    return success(undefined)
  },
  signalerLaRevocationEchouee: () => undefined,
  rendezVousDuCompte,
  supprimerLeCompte: supprimerLeCompteRdv,
  usagersOrphelinsParmi,
  supprimerLesUsagers,
})

type Monde = World & {
  bilan?: BilanDeLEffacement
}

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

Given('un compte RDV connecté avec un rendez-vous et un usager', async () => {
  rdvServicePublic.disponible = true
  rdvServicePublic.revocations = []
  await seedCompteRdv({
    id: ID_TEST.compte,
    accessToken: 'jeton-acces',
    refreshToken: 'jeton-rafraichissement',
  })
  await seedRdv({ id: ID_TEST.rdv, rdvAccountId: ID_TEST.compte })
  await seedUsagerRdv(ID_TEST.usager)
  await seedParticipationRdv({
    id: ID_TEST.participation,
    rdvId: ID_TEST.rdv,
    usagerId: ID_TEST.usager,
  })
})

Given('RDV Service Public est indisponible', () => {
  rdvServicePublic.disponible = false
})

Then(
  'RDV Service Public a reçu la révocation du jeton de rafraîchissement',
  () => {
    assert.deepStrictEqual(
      rdvServicePublic.revocations.map(
        ({ rafraichissement }) => rafraichissement,
      ),
      ['jeton-rafraichissement'],
    )
  },
)

Then('les jetons RDV sont révoqués', function (this: Monde) {
  assert.strictEqual(this.bilan?.jetonsRevoques, true)
})

Then('les jetons RDV ne sont pas révoqués', function (this: Monde) {
  assert.strictEqual(this.bilan?.jetonsRevoques, false)
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

When("j'efface l'empreinte RDV de ce compte", async function (this: Monde) {
  this.bilan = bilanDeLEffacement(
    (await effacer({ utilisateurId: testUtilisateurId })).data,
  )
})

When(
  "j'efface à nouveau l'empreinte RDV de ce compte",
  async function (this: Monde) {
    this.bilan = bilanDeLEffacement(
      (await effacer({ utilisateurId: testUtilisateurId })).data,
    )
  },
)

Then('le compte RDV est délié', function (this: Monde) {
  assert.strictEqual(this.bilan?.compteDelie, true)
})

Then("le compte RDV n'est pas délié", function (this: Monde) {
  assert.strictEqual(this.bilan?.compteDelie, false)
})

Then(
  "l'effacement RDV porte sur {int} rendez-vous",
  function (this: Monde, attendu: number) {
    assert.strictEqual(this.bilan?.rdvsExpurges, attendu)
  },
)

Then(
  "l'effacement RDV supprime {int} usager",
  function (this: Monde, attendu: number) {
    assert.strictEqual(this.bilan?.usagersSupprimes, attendu)
  },
)

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

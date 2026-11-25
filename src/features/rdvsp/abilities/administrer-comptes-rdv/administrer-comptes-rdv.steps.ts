import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import {
  ID_TEST,
  seedCompteRdv,
  seedRdv,
  testUtilisateurId,
} from '@/features/rdvsp/rdvsp.cucumber'
import type {
  CompteAdministre,
  ComptesAdministres,
} from './domain/comptes-administres'
import { compteRdvDetaille } from './implementations/prisma/compte-rdv-detaille.query'
import { comptesRdv } from './implementations/prisma/comptes-rdv.query'

const AGENT_ID = ID_TEST.compte + 20
const RDV_ID = ID_TEST.rdv + 500
const ORGANISATION_ID = ID_TEST.organisation + 500

const administration: {
  liste?: ComptesAdministres
  detail?: CompteAdministre | null
} = {}

Given(
  'un compte RDV relié qui a remonté {int} rendez-vous',
  async (nombre: number) => {
    await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
    await Array.from({ length: nombre }, (_, rang) => RDV_ID + rang).reduce(
      async (precedent, id) => {
        await precedent
        await seedRdv({
          id,
          rdvAccountId: AGENT_ID,
          organisationId: ORGANISATION_ID,
        })
      },
      Promise.resolve(),
    )
  },
)

When("l'administration liste les comptes RDV", async () => {
  administration.liste = await comptesRdv()
})

When("l'administration consulte le détail de ce compte", async () => {
  administration.detail = await compteRdvDetaille({
    userId: testUtilisateurId,
  })
})

When(
  "l'administration consulte le détail d'un utilisateur sans compte RDV",
  async () => {
    administration.detail = await compteRdvDetaille({
      userId: v4(),
    })
  },
)

Then('ce compte est listé avec {int} rendez-vous', (attendu: number) => {
  const compte = administration.liste?.users.find(
    ({ rdvAccount }) => rdvAccount.id === AGENT_ID,
  )
  assert.ok(compte, 'Compte RDV absent de la liste')
  assert.strictEqual(compte.rdvAccount._count.rdvs, attendu)
})

Then('le détail de ce compte est affiché', () => {
  assert.strictEqual(administration.detail?.user.rdvAccount.id, AGENT_ID)
})

Then("aucun détail n'est affiché", () => {
  assert.strictEqual(administration.detail, null)
})

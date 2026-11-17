import assert from 'node:assert'
import {
  ID_TEST,
  seedCompteRdv,
  seedRdv,
  testUtilisateurId,
} from '@app/web/features/rdvsp/rdvsp.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { getAdministrationRdvspUserData } from './implementation/prisma/compte-rdv-detaille.query'
import {
  type AdministrationRdvspData,
  getAdministrationRdvspData,
} from './implementation/prisma/comptes-rdv.query'

const AGENT_ID = ID_TEST.compte + 20
const RDV_ID = ID_TEST.rdv + 500
const ORGANISATION_ID = ID_TEST.organisation + 500

const administration: {
  liste?: AdministrationRdvspData
  detail?: Awaited<ReturnType<typeof getAdministrationRdvspUserData>>
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
  administration.liste = await getAdministrationRdvspData()
})

When("l'administration consulte le détail de ce compte", async () => {
  administration.detail = await getAdministrationRdvspUserData({
    userId: testUtilisateurId,
  })
})

When(
  "l'administration consulte le détail d'un utilisateur sans compte RDV",
  async () => {
    administration.detail = await getAdministrationRdvspUserData({
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

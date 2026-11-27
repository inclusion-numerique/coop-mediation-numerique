import assert from 'node:assert'
import { Given, Then, When, type World } from '@cucumber/cucumber'
import { declencherSynchronisation } from '@/features/rdvsp/abilities/declencher-synchronisation/domain/declencher-synchronisation'
import { compteACible } from '@/features/rdvsp/abilities/declencher-synchronisation/implementations/prisma/compte-a-cible.query'
import { marquerEchecDeSynchronisation } from '@/features/rdvsp/abilities/declencher-synchronisation/implementations/prisma/marquer-echec.mutation'
import { JetonRevoque } from '@/features/rdvsp/domain/errors'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import type { PorteeDeSynchronisation } from '@/features/rdvsp/domain/portee-de-synchronisation'
import {
  compteRdvEnBase,
  ID_TEST,
  seedCompteRdv,
  testUtilisateurId,
} from '@/features/rdvsp/rdvsp.cucumber'
import { failure, success } from '@/libraries/result'

const AGENT_ID = ID_TEST.compte + 8
const MAINTENANT = new Date('2026-08-17T16:00:00.000Z')

const AUTRUI = UtilisateurCoopId('9c858901-8a57-4791-81fe-4c455b099bc9')
const ADMINISTRATEUR = UtilisateurCoopId('d0f9a5b2-1d2f-4d0f-9a7c-6b0f2a1c4e88')

type Monde = World & {
  portee?: PorteeDeSynchronisation
  echoue?: boolean
  resultat?: Awaited<ReturnType<ReturnType<typeof declencherPour>>>
}

const declencherPour = (monde: Monde) =>
  declencherSynchronisation({
    compteACible,
    synchroniser: async ({ compte, portee }) => {
      monde.portee = portee

      return monde.echoue
        ? failure(JetonRevoque(compte.agentId))
        : success({ derive: 3 })
    },
    marquerEchec: marquerEchecDeSynchronisation,
    signaler: () => undefined,
  })

Given('un compte RDV synchronisable', async () => {
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
})

Given(
  'un compte RDV synchronisable dont les webhooks ont échoué sur les organisations {string}',
  async (ids: string) => {
    await seedCompteRdv({
      id: AGENT_ID,
      accessToken: 'jeton-acces',
      invalidWebhookOrganisationIds: ids.split(',').map(Number),
    })
  },
)

Given('un compte RDV en erreur à synchroniser', async () => {
  await seedCompteRdv({
    id: AGENT_ID,
    accessToken: 'jeton-acces',
    error: 'Impossible de récupérer les données du compte RDV Service Public',
    invalidWebhookOrganisationIds: [9920001],
  })
})

Given('un compte RDV déconnecté à synchroniser', async () => {
  await seedCompteRdv({
    id: AGENT_ID,
    deleted: new Date('2026-08-01T10:00:00.000Z'),
  })
})

Given('aucun compte RDV à synchroniser', () => undefined)

Given('la synchronisation échoue', function (this: Monde) {
  this.echoue = true
})

When(
  'je déclenche une synchronisation complète pour moi-même',
  async function (this: Monde) {
    this.resultat = await declencherPour(this)({
      demandeur: { id: testUtilisateurId, role: 'User' },
      utilisateurId: testUtilisateurId,
      seulementSansWebhook: false,
      maintenant: MAINTENANT,
    })
  },
)

When(
  'je déclenche une synchronisation complète pour un autre médiateur',
  async function (this: Monde) {
    this.resultat = await declencherPour(this)({
      demandeur: { id: testUtilisateurId, role: 'User' },
      utilisateurId: AUTRUI,
      seulementSansWebhook: false,
      maintenant: MAINTENANT,
    })
  },
)

When(
  'un administrateur déclenche une synchronisation complète pour moi',
  async function (this: Monde) {
    this.resultat = await declencherPour(this)({
      demandeur: { id: ADMINISTRATEUR, role: 'Admin' },
      utilisateurId: testUtilisateurId,
      seulementSansWebhook: false,
      maintenant: MAINTENANT,
    })
  },
)

When('je déclenche un rattrapage pour moi-même', async function (this: Monde) {
  this.resultat = await declencherPour(this)({
    demandeur: { id: testUtilisateurId, role: 'User' },
    utilisateurId: testUtilisateurId,
    seulementSansWebhook: true,
    maintenant: MAINTENANT,
  })
})

Then(
  'la synchronisation a parcouru toutes les organisations',
  function (this: Monde) {
    assert.ok(this.resultat?.success, 'Le déclenchement a échoué')
    assert.strictEqual(this.portee?._tag, 'toutesOrganisations')
  },
)

Then(
  'la synchronisation a parcouru les organisations {string}',
  function (this: Monde, ids: string) {
    assert.ok(this.resultat?.success, 'Le déclenchement a échoué')
    assert.deepStrictEqual(this.portee, {
      _tag: 'organisations',
      organisationIds: ids.split(',').map(Number),
    })
  },
)

Then('aucune synchronisation n’a été lancée', function (this: Monde) {
  assert.strictEqual(this.portee, undefined)
})

Then(
  'le déclenchement ne rend aucune date de synchronisation',
  function (this: Monde) {
    assert.ok(this.resultat?.success, 'Le déclenchement a échoué')
    assert.strictEqual(this.resultat.data.synchroniseeLe, null)
  },
)

Then('le déclenchement réussit sans dérive', function (this: Monde) {
  assert.ok(this.resultat?.success, 'Le déclenchement a échoué')
  assert.strictEqual(this.resultat.data.derive, 0)
})

Then(
  'le déclenchement échoue avec l’erreur {string}',
  function (this: Monde, tag: string) {
    assert.ok(
      this.resultat && !this.resultat.success,
      'Le déclenchement aurait dû échouer',
    )
    assert.strictEqual(this.resultat.error._tag, tag)
  },
)

Then('le compte porte l’erreur {string}', async (message: string) => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.strictEqual(row?.error, message)
})

Then('la date de dernière tentative est enregistrée', async () => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.deepStrictEqual(row?.lastSynced, MAINTENANT)
})

import assert from 'node:assert'
import { Before, Given, Then, When } from '@cucumber/cucumber'
import { declencherSynchronisation } from '@/features/rdvsp/abilities/declencher-synchronisation/domain/declencher-synchronisation'
import type { SynchroniserLeCompte } from '@/features/rdvsp/abilities/declencher-synchronisation/domain/ports'
import { compteACible } from '@/features/rdvsp/abilities/declencher-synchronisation/implementations/prisma/compte-a-cible.query'
import { marquerEchecDeSynchronisation } from '@/features/rdvsp/abilities/declencher-synchronisation/implementations/prisma/marquer-echec.mutation'
import { JetonRevoque } from '@/features/rdvsp/domain/errors'
import type { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
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

/** Ce que la passe doublée a reçu — `undefined` tant qu'elle n'a pas été lancée. */
let portee: { organisationIds?: readonly OrganisationId[] } | undefined
let echoue = false
let resultat: Awaited<ReturnType<typeof declencher>> | undefined

const synchroniser: SynchroniserLeCompte = async ({
  compte,
  organisationIds,
}) => {
  portee = organisationIds === undefined ? {} : { organisationIds }

  return echoue ? failure(JetonRevoque(compte.agentId)) : success({ derive: 3 })
}

const declencher = declencherSynchronisation({
  compteACible,
  synchroniser,
  marquerEchec: marquerEchecDeSynchronisation,
  signaler: () => undefined,
})

Before(() => {
  portee = undefined
  echoue = false
  resultat = undefined
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

Given('aucun compte RDV à synchroniser', () => {
  // Le hook Before de la feature a déjà retiré tout compte de l'utilisateur.
})

Given('la synchronisation échoue', () => {
  echoue = true
})

When('je déclenche une synchronisation complète pour moi-même', async () => {
  resultat = await declencher({
    demandeur: { id: testUtilisateurId, role: 'User' },
    utilisateurId: testUtilisateurId,
    seulementSansWebhook: false,
    maintenant: MAINTENANT,
  })
})

When(
  'je déclenche une synchronisation complète pour un autre médiateur',
  async () => {
    resultat = await declencher({
      demandeur: { id: testUtilisateurId, role: 'User' },
      utilisateurId: AUTRUI,
      seulementSansWebhook: false,
      maintenant: MAINTENANT,
    })
  },
)

When(
  'un administrateur déclenche une synchronisation complète pour moi',
  async () => {
    resultat = await declencher({
      demandeur: { id: ADMINISTRATEUR, role: 'Admin' },
      utilisateurId: testUtilisateurId,
      seulementSansWebhook: false,
      maintenant: MAINTENANT,
    })
  },
)

When('je déclenche un rattrapage pour moi-même', async () => {
  resultat = await declencher({
    demandeur: { id: testUtilisateurId, role: 'User' },
    utilisateurId: testUtilisateurId,
    seulementSansWebhook: true,
    maintenant: MAINTENANT,
  })
})

Then('la synchronisation a parcouru toutes les organisations', () => {
  assert.ok(resultat?.success, 'Le déclenchement a échoué')
  assert.ok(portee, 'La synchronisation n’a pas été lancée')
  assert.strictEqual(portee.organisationIds, undefined)
})

Then(
  'la synchronisation a parcouru les organisations {string}',
  (ids: string) => {
    assert.ok(resultat?.success, 'Le déclenchement a échoué')
    assert.deepStrictEqual(portee?.organisationIds, ids.split(',').map(Number))
  },
)

Then('aucune synchronisation n’a été lancée', () => {
  assert.strictEqual(portee, undefined)
})

Then('le déclenchement ne rend aucune date de synchronisation', () => {
  assert.ok(resultat?.success, 'Le déclenchement a échoué')
  assert.strictEqual(resultat.data.synchroniseeLe, null)
})

Then('le déclenchement réussit sans dérive', () => {
  assert.ok(resultat?.success, 'Le déclenchement a échoué')
  assert.strictEqual(resultat.data.derive, 0)
})

Then('le déclenchement échoue avec l’erreur {string}', (tag: string) => {
  assert.ok(resultat && !resultat.success, 'Le déclenchement aurait dû échouer')
  assert.strictEqual(resultat.error._tag, tag)
})

Then('le compte porte l’erreur {string}', async (message: string) => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.strictEqual(row?.error, message)
})

Then('la date de dernière tentative est enregistrée', async () => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.deepStrictEqual(row?.lastSynced, MAINTENANT)
})

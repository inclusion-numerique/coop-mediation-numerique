import assert from 'node:assert'
import { CodeAutorisation } from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/domain/code-autorisation'
import type {
  ConnecterCompteRdv,
  EchangerCodeAutorisation,
} from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/domain/connecter-compte-rdv'
import { CodeAutorisationRefuse } from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/domain/errors'
import { connecterCompteRdv } from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/implementation/connecter-compte-rdv'
import { compteRdvExistant } from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/implementation/prisma/compte-rdv-existant.query'
import { enregistrerCompteConnecte } from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/implementation/prisma/enregistrer-compte-connecte.mutation'
import type { Agent } from '@app/web/features/rdvsp/domain/agent'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
} from '@app/web/features/rdvsp/domain/identite'
import {
  JetonAcces,
  JetonRafraichissement,
  type JetonsOAuth,
} from '@app/web/features/rdvsp/domain/jetons-oauth'
import { RdvAgentId } from '@app/web/features/rdvsp/domain/rdv-agent-id'
import type { RdvServicePublicApi } from '@app/web/features/rdvsp/domain/rdv-service-public.port'
import {
  compteRdvEnBase,
  emailUtilisateurDeTest,
  seedCompteRdv,
  suivreCompteRdv,
  testUtilisateurId,
} from '@app/web/features/rdvsp/rdvsp.cucumber'
import { failure, success } from '@app/web/libraries/result'
import { Given, Then, When } from '@cucumber/cucumber'

const AGENT_ID = 987_654
const MAINTENANT = new Date('2026-08-17T14:30:00.000Z')

const jetonsEchanges: JetonsOAuth = {
  acces: JetonAcces('jeton-acces-neuf'),
  rafraichissement: JetonRafraichissement('jeton-rafraichissement-neuf'),
  expiration: new Date('2026-08-17T16:30:00.000Z'),
  portee: null,
}

let agentAttendu: Agent | undefined
let echangeRefuse = false
let resultat: Awaited<ReturnType<ConnecterCompteRdv>> | undefined

/**
 * L'API RDV Service Public est doublée — la base, elle, est bien réelle (DV-2) :
 * ces scénarios valident le comportement Prisma de l'ability, pas le transport
 * HTTP, qui appartient à l'adaptateur.
 */
const echangerCodeDouble: EchangerCodeAutorisation = async () =>
  echangeRefuse
    ? failure(CodeAutorisationRefuse('invalid_grant'))
    : success(jetonsEchanges)

const identifierAgentDouble: RdvServicePublicApi['identifierAgent'] =
  async () => {
    assert.ok(agentAttendu, 'Aucun agent RDV Service Public défini')
    return success(agentAttendu)
  }

const connecter = connecterCompteRdv({
  echangerCode: echangerCodeDouble,
  identifierAgent: identifierAgentDouble,
  compteExistant: compteRdvExistant,
  enregistrer: enregistrerCompteConnecte,
  maintenant: () => MAINTENANT,
})

const agentAvecEmail = (email: string): Agent => ({
  id: RdvAgentId(AGENT_ID),
  email: EmailExterne(email),
  prenom: PrenomExterne('Agent'),
  nom: NomExterne('RDV'),
})

Given('un agent RDV Service Public portant l’e-mail du médiateur', async () => {
  echangeRefuse = false
  agentAttendu = agentAvecEmail(await emailUtilisateurDeTest())
})

Given(
  'un agent RDV Service Public portant l’e-mail {string}',
  (email: string) => {
    echangeRefuse = false
    agentAttendu = agentAvecEmail(email)
  },
)

Given('un code d’autorisation refusé', () => {
  echangeRefuse = true
  agentAttendu = agentAvecEmail('agent@example.com')
})

Given(
  'un compte RDV déjà lié synchronisé depuis le {string}',
  async (jour: string) => {
    await seedCompteRdv({
      id: AGENT_ID,
      accessToken: 'ancien-jeton',
      syncFrom: new Date(`${jour}T00:00:00.000Z`),
    })
  },
)

Given('un compte RDV en erreur {string}', async (erreur: string) => {
  await seedCompteRdv({
    id: AGENT_ID,
    accessToken: 'ancien-jeton',
    error: erreur,
  })
})

Given('un compte RDV déconnecté', async () => {
  await seedCompteRdv({
    id: AGENT_ID,
    deleted: new Date('2026-07-08T12:00:00.000Z'),
  })
})

Given(
  'un compte RDV déjà lié affichant les rendez-vous dans les activités',
  async () => {
    await seedCompteRdv({
      id: AGENT_ID,
      accessToken: 'ancien-jeton',
      includeRdvsInActivitesList: true,
    })
  },
)

When('je connecte mon compte RDV Service Public', async () => {
  suivreCompteRdv(AGENT_ID)
  resultat = await connecter({
    utilisateurId: testUtilisateurId,
    emailUtilisateur: await emailUtilisateurDeTest(),
    code: CodeAutorisation('code-oauth'),
  })
})

Then('le compte est lié', () => {
  assert.ok(resultat?.success, 'La connexion a échoué')
  assert.strictEqual(resultat.data._tag, 'lie')
})

Then('le compte est enregistré avec les jetons reçus', async () => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.ok(row, 'Le compte devrait être enregistré')
  assert.strictEqual(row.accessToken, jetonsEchanges.acces)
  assert.strictEqual(row.refreshToken, jetonsEchanges.rafraichissement)
  assert.strictEqual(row.userId, testUtilisateurId)
})

Then('la synchronisation démarre au début du jour courant', async () => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.deepStrictEqual(row?.syncFrom, new Date(2026, 7, 17))
})

Then(
  'la synchronisation démarre toujours au {string}',
  async (jour: string) => {
    const row = await compteRdvEnBase(AGENT_ID)
    assert.deepStrictEqual(row?.syncFrom, new Date(`${jour}T00:00:00.000Z`))
  },
)

Then('le compte ne porte plus d’erreur', async () => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.strictEqual(row?.error, null)
})

Then('le compte n’est plus marqué déconnecté', async () => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.strictEqual(row?.deleted, null)
})

Then(
  'le compte affiche toujours les rendez-vous dans les activités',
  async () => {
    const row = await compteRdvEnBase(AGENT_ID)
    assert.strictEqual(row?.includeRdvsInActivitesList, true)
  },
)

Then('la connexion échoue avec l’erreur {string}', (tag: string) => {
  assert.ok(resultat && !resultat.success, 'La connexion aurait dû échouer')
  assert.strictEqual(resultat.error._tag, tag)
})

Then('aucun compte RDV n’est enregistré', async () => {
  assert.strictEqual(await compteRdvEnBase(AGENT_ID), null)
})

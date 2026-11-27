import assert from 'node:assert'
import { Given, Then, When, type World } from '@cucumber/cucumber'
import { CodeAutorisation } from '@/features/rdvsp/abilities/connecter-compte-rdv/domain/code-autorisation'
import { connecterCompteRdv } from '@/features/rdvsp/abilities/connecter-compte-rdv/domain/connecter-compte-rdv'
import { CodeAutorisationRefuse } from '@/features/rdvsp/abilities/connecter-compte-rdv/domain/errors'
import { compteRdvExistant } from '@/features/rdvsp/abilities/connecter-compte-rdv/implementations/prisma/compte-rdv-existant.query'
import { enregistrerCompteConnecte } from '@/features/rdvsp/abilities/connecter-compte-rdv/implementations/prisma/enregistrer-compte-connecte.mutation'
import type { Agent } from '@/features/rdvsp/domain/agent'
import {
  JetonAcces,
  JetonRafraichissement,
  type JetonsOAuth,
} from '@/features/rdvsp/domain/compte/jetons-oauth'
import { RdvAgentId } from '@/features/rdvsp/domain/identifiants/rdv-agent-id'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
} from '@/features/rdvsp/domain/identite'
import {
  compteRdvEnBase,
  emailUtilisateurDeTest,
  ID_TEST,
  seedCompteRdv,
  suivreCompteRdv,
  testUtilisateurId,
} from '@/features/rdvsp/rdvsp.cucumber'
import { failure, success } from '@/libraries/result'

const AGENT_ID = ID_TEST.compte + 1
const MAINTENANT = new Date('2026-08-17T14:30:00.000Z')

const jetonsEchanges: JetonsOAuth = {
  acces: JetonAcces('jeton-acces-neuf'),
  rafraichissement: JetonRafraichissement('jeton-rafraichissement-neuf'),
  expiration: new Date('2026-08-17T16:30:00.000Z'),
  portee: null,
}

type Monde = World & {
  agentAttendu?: Agent
  echangeRefuse?: boolean
  resultat?: Awaited<ReturnType<ReturnType<typeof connecterPour>>>
}

const connecterPour = (monde: Monde) =>
  connecterCompteRdv({
    echangerCode: async () =>
      monde.echangeRefuse
        ? failure(CodeAutorisationRefuse('invalid_grant'))
        : success(jetonsEchanges),
    identifierAgent: async () => {
      assert.ok(monde.agentAttendu, 'Aucun agent RDV Service Public défini')
      return success(monde.agentAttendu)
    },
    compteExistant: compteRdvExistant,
    enregistrer: enregistrerCompteConnecte,
  })

const agentAvecEmail = (email: string): Agent => ({
  id: RdvAgentId(AGENT_ID),
  email: EmailExterne(email),
  prenom: PrenomExterne('Agent'),
  nom: NomExterne('RDV'),
})

Given(
  'un agent RDV Service Public portant l’e-mail du médiateur',
  async function (this: Monde) {
    this.agentAttendu = agentAvecEmail(await emailUtilisateurDeTest())
  },
)

Given(
  'un agent RDV Service Public portant l’e-mail {string}',
  function (this: Monde, email: string) {
    this.agentAttendu = agentAvecEmail(email)
  },
)

Given('un code d’autorisation refusé', function (this: Monde) {
  this.echangeRefuse = true
  this.agentAttendu = agentAvecEmail('agent@example.com')
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

Given(
  'un compte RDV déjà lié masquant les rendez-vous dans les activités',
  async () => {
    await seedCompteRdv({
      id: AGENT_ID,
      accessToken: 'ancien-jeton',
      includeRdvsInActivitesList: false,
    })
  },
)

When('je connecte mon compte RDV Service Public', async function (this: Monde) {
  suivreCompteRdv(AGENT_ID)
  this.resultat = await connecterPour(this)({
    utilisateurId: testUtilisateurId,
    emailUtilisateur: await emailUtilisateurDeTest(),
    code: CodeAutorisation('code-oauth'),
    maintenant: MAINTENANT,
  })
})

Then('le compte est lié', function (this: Monde) {
  assert.ok(this.resultat?.success, 'La connexion a échoué')
  assert.strictEqual(this.resultat.data.compte._tag, 'lie')
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

Then(
  'le compte masque toujours les rendez-vous dans les activités',
  async () => {
    const row = await compteRdvEnBase(AGENT_ID)
    assert.strictEqual(row?.includeRdvsInActivitesList, false)
  },
)

Then(
  'le compte connecté affiche les rendez-vous dans les activités',
  async () => {
    const row = await compteRdvEnBase(AGENT_ID)
    assert.strictEqual(row?.includeRdvsInActivitesList, true)
  },
)

Then(
  'la connexion échoue avec l’erreur {string}',
  function (this: Monde, tag: string) {
    assert.ok(
      this.resultat && !this.resultat.success,
      'La connexion aurait dû échouer',
    )
    assert.strictEqual(this.resultat.error._tag, tag)
  },
)

Then('aucun compte RDV n’est enregistré', async () => {
  assert.strictEqual(await compteRdvEnBase(AGENT_ID), null)
})

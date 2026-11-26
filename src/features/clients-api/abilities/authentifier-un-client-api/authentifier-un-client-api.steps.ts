import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { authentifierUnClientApi } from '@/features/clients-api/abilities/authentifier-un-client-api/domain/authentifier-un-client-api'
import type { EchecDAuthentifierUnClientApi } from '@/features/clients-api/abilities/authentifier-un-client-api/domain/errors'
import { lireLeClientApiAAuthentifier } from '@/features/clients-api/abilities/authentifier-un-client-api/implementations/prisma/client-api-a-authentifier.query'
import {
  clientSeme,
  jour,
  portees,
  semerUnClientApi,
} from '@/features/clients-api/clients-api.cucumber'
import { verifySecret } from '@/features/clients-api/implementations/secret/hash-secret.adapter'

type IssueDeLAppel = 'Authentifie' | EchecDAuthentifierUnClientApi['_tag']

const appel: { issue?: IssueDeLAppel } = {}

Given(
  'un client API {string} valable du {word} sans fin',
  async (nom: string, debut: string) => {
    await semerUnClientApi({ nom, debut })
  },
)

Given(
  'un client API {string} valable du {word} au {word}',
  async (nom: string, debut: string, fin: string) => {
    await semerUnClientApi({ nom, debut, fin })
  },
)

When(
  /^le client API "([^"]+)" appelle une route "([^"]+)" le (\S+) avec (son secret|un autre secret)$/,
  async (nom: string, liste: string, date: string, secret: string) => {
    const seme = clientSeme(nom)
    const resultat = await authentifierUnClientApi({
      lireLeClientApiAAuthentifier,
      verifierUnSecret: verifySecret,
    })({
      clientApiId: seme.id,
      secret: secret === 'son secret' ? seme.secret : 'f'.repeat(64),
      portees: portees(liste),
      maintenant: jour(date),
    })
    appel.issue = resultat.success ? 'Authentifie' : resultat.error._tag
  },
)

Then("l'appel est authentifié", () => {
  assert.strictEqual(appel.issue, 'Authentifie')
})

Then("l'appel n'est pas authentifié", () => {
  assert.strictEqual(appel.issue, 'NonAuthentifie')
})

Then("l'appel est authentifié sans la permission", () => {
  assert.strictEqual(appel.issue, 'NonAutorise')
})

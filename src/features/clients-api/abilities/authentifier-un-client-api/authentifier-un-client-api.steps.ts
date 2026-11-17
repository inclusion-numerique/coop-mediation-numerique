import assert from 'node:assert'
import { authentifierUnClientApi } from '@app/web/features/clients-api/abilities/authentifier-un-client-api'
import {
  clientSeme,
  jour,
  portees,
  semerUnClientApi,
} from '@app/web/features/clients-api/clients-api.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

const appel: { authentifie?: boolean } = {}

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
    appel.authentifie = await authentifierUnClientApi({
      clientApiId: seme.id,
      secret: secret === 'son secret' ? seme.secret : 'f'.repeat(64),
      portees: portees(liste),
      maintenant: jour(date),
    })
  },
)

Then("l'appel est authentifié", () => {
  assert.strictEqual(appel.authentifie, true)
})

Then("l'appel est refusé", () => {
  assert.strictEqual(appel.authentifie, false)
})

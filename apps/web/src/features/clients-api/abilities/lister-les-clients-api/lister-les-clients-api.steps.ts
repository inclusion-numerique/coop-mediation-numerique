import assert from 'node:assert'
import { listerLesClientsApi } from '@app/web/features/clients-api/abilities/lister-les-clients-api'
import { clientSeme } from '@app/web/features/clients-api/clients-api.cucumber'
import type { ClientApi } from '@app/web/features/clients-api/domain'
import { Then, When } from '@cucumber/cucumber'

const liste: { clients: readonly ClientApi[] } = { clients: [] }

const rangDe = (nom: string): number =>
  liste.clients.findIndex(({ id }) => id === clientSeme(nom).id)

When("l'administration liste les clients API", async () => {
  liste.clients = await listerLesClientsApi()
})

Then(
  '{string} précède {string} dans la liste',
  (premier: string, second: string) => {
    assert.ok(rangDe(premier) >= 0 && rangDe(second) >= 0)
    assert.ok(rangDe(premier) < rangDe(second))
  },
)

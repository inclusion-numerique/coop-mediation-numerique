import assert from 'node:assert'
import { consulterUnClientApi } from '@app/web/features/clients-api/abilities/consulter-un-client-api'
import {
  clientSeme,
  portees,
} from '@app/web/features/clients-api/clients-api.cucumber'
import { Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

const consultation: {
  resultat?: Awaited<ReturnType<typeof consulterUnClientApi>>
} = {}

When(
  "l'administration consulte le client API {string}",
  async (nom: string) => {
    consultation.resultat = await consulterUnClientApi(clientSeme(nom).id)
  },
)

When("l'administration consulte un client API qui n'existe pas", async () => {
  consultation.resultat = await consulterUnClientApi(v4())
})

Then('la fiche présente les permissions {string}', (liste: string) => {
  assert.ok(consultation.resultat?.success)
  assert.deepStrictEqual(consultation.resultat.data.portees, portees(liste))
})

Then('la consultation échoue car le client API est introuvable', () => {
  assert.ok(consultation.resultat && !consultation.resultat.success)
  assert.strictEqual(consultation.resultat.error._tag, 'ClientApiIntrouvable')
})

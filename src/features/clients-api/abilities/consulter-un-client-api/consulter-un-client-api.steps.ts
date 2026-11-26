import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { consulterUnClientApi } from '@/features/clients-api/abilities/consulter-un-client-api/domain/consulter-un-client-api'
import { lireLeClientApi } from '@/features/clients-api/abilities/consulter-un-client-api/implementations/prisma/client-api.query'
import {
  clientSeme,
  portees,
} from '@/features/clients-api/clients-api.cucumber'

const consultation: {
  resultat?: Awaited<ReturnType<ReturnType<typeof consulterUnClientApi>>>
} = {}

When(
  "l'administration consulte le client API {string}",
  async (nom: string) => {
    consultation.resultat = await consulterUnClientApi({ lireLeClientApi })(
      clientSeme(nom).id,
    )
  },
)

When("l'administration consulte un client API qui n'existe pas", async () => {
  consultation.resultat = await consulterUnClientApi({ lireLeClientApi })(v4())
})

Then('la fiche présente les permissions {string}', (liste: string) => {
  assert.ok(consultation.resultat?.success)
  assert.deepStrictEqual(consultation.resultat.data.portees, portees(liste))
})

Then('la consultation échoue car le client API est introuvable', () => {
  assert.ok(consultation.resultat && !consultation.resultat.success)
  assert.strictEqual(consultation.resultat.error._tag, 'ClientApiIntrouvable')
})

import assert from 'node:assert'
import { renouvelerLeSecret } from '@app/web/features/clients-api/abilities/renouveler-le-secret'
import {
  clientSeme,
  leSecretOuvreLAcces,
} from '@app/web/features/clients-api/clients-api.cucumber'
import { Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

const renouvellement: {
  resultat?: Awaited<ReturnType<typeof renouvelerLeSecret>>
} = {}

When(
  "l'administration renouvelle le secret du client API {string}",
  async (nom: string) => {
    renouvellement.resultat = await renouvelerLeSecret({
      clientApiId: clientSeme(nom).id,
    })
  },
)

When(
  "l'administration renouvelle le secret d'un client API qui n'existe pas",
  async () => {
    renouvellement.resultat = await renouvelerLeSecret({ clientApiId: v4() })
  },
)

Then(
  "l'ancien secret du client API {string} n'authentifie plus",
  async (nom: string) => {
    const { id, secret } = clientSeme(nom)
    assert.strictEqual(await leSecretOuvreLAcces(id, secret), false)
  },
)

Then(
  'le nouveau secret du client API {string} authentifie',
  async (nom: string) => {
    assert.ok(renouvellement.resultat?.success)
    assert.strictEqual(
      await leSecretOuvreLAcces(
        clientSeme(nom).id,
        renouvellement.resultat.data.secret,
      ),
      true,
    )
  },
)

Then('le renouvellement échoue car le client API est introuvable', () => {
  assert.ok(renouvellement.resultat && !renouvellement.resultat.success)
  assert.strictEqual(renouvellement.resultat.error._tag, 'ClientApiIntrouvable')
})

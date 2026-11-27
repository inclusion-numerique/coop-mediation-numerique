import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { renouvelerLeSecret } from '@/features/clients-api/abilities/renouveler-le-secret/domain/renouveler-le-secret'
import { enregistrerLeSecret } from '@/features/clients-api/abilities/renouveler-le-secret/implementations/prisma/enregistrer-le-secret.mutation'
import {
  clientSeme,
  leSecretOuvreLAcces,
} from '@/features/clients-api/clients-api.cucumber'
import { ClientApiId } from '@/features/clients-api/domain'
import { clientApiExiste } from '@/features/clients-api/implementations/prisma/client-api-existe.query'
import { nouveauSecret } from '@/features/clients-api/implementations/secret/secret.adapter'

const renouvellement: {
  resultat?: Awaited<ReturnType<ReturnType<typeof renouvelerLeSecret>>>
} = {}

When(
  "l'administration renouvelle le secret du client API {string}",
  async (nom: string) => {
    renouvellement.resultat = await renouvelerLeSecret({
      clientApiExiste,
      genererUnSecret: nouveauSecret,
      enregistrer: enregistrerLeSecret,
    })({
      clientApiId: clientSeme(nom).id,
      maintenant: new Date(),
    })
  },
)

When(
  "l'administration renouvelle le secret d'un client API qui n'existe pas",
  async () => {
    renouvellement.resultat = await renouvelerLeSecret({
      clientApiExiste,
      genererUnSecret: nouveauSecret,
      enregistrer: enregistrerLeSecret,
    })({
      clientApiId: ClientApiId(v4()),
      maintenant: new Date(),
    })
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

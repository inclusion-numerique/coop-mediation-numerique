import assert from 'node:assert'
import { creerUnClientApi } from '@app/web/features/clients-api/abilities/creer-un-client-api'
import {
  clientSeme,
  jour,
  nomUnique,
  portees,
  retenirLeClient,
} from '@app/web/features/clients-api/clients-api.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Then, When } from '@cucumber/cucumber'

const creation: { resultat?: Awaited<ReturnType<typeof creerUnClientApi>> } = {}

When(
  "l'administration crée le client API {string} avec les permissions {string} à partir du {word}",
  async (nom: string, liste: string, debut: string) => {
    creation.resultat = await creerUnClientApi({
      nom: nomUnique(nom),
      portees: portees(liste),
      validite: { debut: jour(debut), fin: null },
    })
    if (creation.resultat.success)
      retenirLeClient(nom, {
        id: creation.resultat.data.client.id,
        secret: creation.resultat.data.secret,
      })
  },
)

Then(
  'le client API {string} a les permissions {string}',
  async (nom: string, liste: string) => {
    const ligne = await prismaClient.apiClient.findUniqueOrThrow({
      where: { id: clientSeme(nom).id },
    })
    assert.deepStrictEqual(ligne.scopes, portees(liste))
  },
)

Then(
  'le client API {string} est valable à partir du {word}, sans fin',
  async (nom: string, debut: string) => {
    const ligne = await prismaClient.apiClient.findUniqueOrThrow({
      where: { id: clientSeme(nom).id },
    })
    assert.deepStrictEqual(
      { debut: ligne.validFrom, fin: ligne.validUntil },
      { debut: jour(debut), fin: null },
    )
  },
)

Then('la création échoue car le nom est déjà pris', () => {
  assert.ok(creation.resultat && !creation.resultat.success)
  assert.strictEqual(creation.resultat.error._tag, 'NomDejaPris')
})

import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { creerUnClientApi } from '@/features/clients-api/abilities/creer-un-client-api/domain/creer-un-client-api'
import { enregistrerLeClientApi } from '@/features/clients-api/abilities/creer-un-client-api/implementations/prisma/enregistrer-le-client-api.mutation'
import {
  clientSeme,
  jour,
  nomUnique,
  portees,
  retenirLeClient,
} from '@/features/clients-api/clients-api.cucumber'
import { nomDejaPris } from '@/features/clients-api/implementations/prisma/nom-deja-pris.query'
import { nouveauSecret } from '@/features/clients-api/implementations/secret/secret.adapter'

const creation: {
  resultat?: Awaited<ReturnType<ReturnType<typeof creerUnClientApi>>>
} = {}

When(
  "l'administration crée le client API {string} avec les permissions {string} à partir du {word}",
  async (nom: string, liste: string, debut: string) => {
    creation.resultat = await creerUnClientApi({
      leNomEstPris: nomDejaPris,
      genererUnSecret: nouveauSecret,
      enregistrer: enregistrerLeClientApi,
    })({
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

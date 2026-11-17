import assert from 'node:assert'
import { modifierUnClientApi } from '@app/web/features/clients-api/abilities/modifier-un-client-api'
import {
  clientSeme,
  jour,
  nomUnique,
  portees,
} from '@app/web/features/clients-api/clients-api.cucumber'
import { Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

const modification: {
  resultat?: Awaited<ReturnType<typeof modifierUnClientApi>>
} = {}

When(
  "l'administration modifie le client API {string} avec les permissions {string} du {word} au {word}",
  async (nom: string, liste: string, debut: string, fin: string) => {
    modification.resultat = await modifierUnClientApi({
      clientApiId: clientSeme(nom).id,
      definition: {
        nom: nomUnique(nom),
        portees: portees(liste),
        validite: { debut: jour(debut), fin: jour(fin) },
      },
    })
  },
)

When(
  "l'administration renomme le client API {string} en {string}",
  async (nom: string, nouveauNom: string) => {
    modification.resultat = await modifierUnClientApi({
      clientApiId: clientSeme(nom).id,
      definition: {
        nom: nomUnique(nouveauNom),
        portees: portees('Activites'),
        validite: { debut: jour('01/01/2026'), fin: null },
      },
    })
  },
)

When("l'administration modifie un client API qui n'existe pas", async () => {
  modification.resultat = await modifierUnClientApi({
    clientApiId: v4(),
    definition: {
      nom: nomUnique('Fantôme'),
      portees: portees('Activites'),
      validite: { debut: jour('01/01/2026'), fin: null },
    },
  })
})

Then('la modification échoue car le nom est déjà pris', () => {
  assert.ok(modification.resultat && !modification.resultat.success)
  assert.strictEqual(modification.resultat.error._tag, 'NomDejaPris')
})

Then('la modification échoue car le client API est introuvable', () => {
  assert.ok(modification.resultat && !modification.resultat.success)
  assert.strictEqual(modification.resultat.error._tag, 'ClientApiIntrouvable')
})

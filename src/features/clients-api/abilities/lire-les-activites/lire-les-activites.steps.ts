import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { GET } from '@/app/api/v1/activites/route'
import {
  appelerLApi,
  identifiantsLus,
  semerUneActiviteModifieeLe,
  suivreLaPageSuivante,
} from '@/features/clients-api/clients-api.cucumber'

const activites = new Map<string, string>()

Given(
  'des activités modifiées le {word} et le {word}',
  async (premiere: string, seconde: string) => {
    activites.clear()
    activites.set(premiere, await semerUneActiviteModifieeLe(premiere))
    activites.set(seconde, await semerUneActiviteModifieeLe(seconde))
  },
)

When('un appel sans client API lit les activités', async () => {
  await appelerLApi({ route: GET, chemin: '/activites', client: null })
})

When('le client API {string} lit les activités', async (client: string) => {
  await appelerLApi({ route: GET, chemin: '/activites', client })
})

When(
  'le client API {string} lit les activités avec {string}',
  async (client: string, requete: string) => {
    await appelerLApi({ route: GET, chemin: '/activites', requete, client })
  },
)

When(
  'le client API {string} suit le lien vers la page suivante des activités',
  async (client: string) => {
    await suivreLaPageSuivante(GET, client)
  },
)

Then(
  'la première activité lue est celle modifiée le {word}',
  (modification: string) => {
    assert.strictEqual(identifiantsLus().at(0), activites.get(modification))
  },
)

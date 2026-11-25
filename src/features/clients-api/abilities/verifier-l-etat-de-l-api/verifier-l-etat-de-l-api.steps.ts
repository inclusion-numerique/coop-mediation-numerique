import { When } from '@cucumber/cucumber'
import { GET } from '@/app/api/v1/health/route'
import { appelerLApi } from '@/features/clients-api/clients-api.cucumber'

const chemin = '/health'

When("un appel sans client API vérifie l'état de l'API", async () => {
  await appelerLApi({ route: GET, chemin, client: null })
})

When(
  "le client API {string} vérifie l'état de l'API",
  async (client: string) => {
    await appelerLApi({ route: GET, chemin, client })
  },
)

When(
  "le client API {string} vérifie l'état de l'API avec {string}",
  async (client: string, requete: string) => {
    await appelerLApi({ route: GET, chemin, requete, client })
  },
)

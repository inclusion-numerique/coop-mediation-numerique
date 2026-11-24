import { When } from '@cucumber/cucumber'
import { GET } from '@/app/api/v1/statistiques/route'
import { appelerLApi } from '@/features/clients-api/clients-api.cucumber'

const chemin = '/statistiques'

When('un appel sans client API lit les statistiques', async () => {
  await appelerLApi({ route: GET, chemin, client: null })
})

When('le client API {string} lit les statistiques', async (client: string) => {
  await appelerLApi({ route: GET, chemin, client })
})

When(
  'le client API {string} lit les statistiques avec {string}',
  async (client: string, requete: string) => {
    await appelerLApi({ route: GET, chemin, requete, client })
  },
)

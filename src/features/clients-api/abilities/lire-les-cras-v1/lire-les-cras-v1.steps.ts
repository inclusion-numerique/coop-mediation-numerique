import { When } from '@cucumber/cucumber'
import { GET } from '@/app/api/v1/archives-v1/cras/route'
import { appelerLApi } from '@/features/clients-api/clients-api.cucumber'

const chemin = '/archives-v1/cras'

When('un appel sans client API lit les CRA v1', async () => {
  await appelerLApi({ route: GET, chemin, client: null })
})

When('le client API {string} lit les CRA v1', async (client: string) => {
  await appelerLApi({ route: GET, chemin, client })
})

When(
  'le client API {string} lit les CRA v1 avec {string}',
  async (client: string, requete: string) => {
    await appelerLApi({ route: GET, chemin, requete, client })
  },
)

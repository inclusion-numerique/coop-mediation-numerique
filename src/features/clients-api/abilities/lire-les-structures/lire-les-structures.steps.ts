import { When } from '@cucumber/cucumber'
import { GET } from '@/app/api/v1/structures/route'
import { appelerLApi } from '@/features/clients-api/clients-api.cucumber'

const chemin = '/structures'

When('un appel sans client API lit les structures', async () => {
  await appelerLApi({ route: GET, chemin, client: null })
})

When('le client API {string} lit les structures', async (client: string) => {
  await appelerLApi({ route: GET, chemin, client })
})

When(
  'le client API {string} lit les structures avec {string}',
  async (client: string, requete: string) => {
    await appelerLApi({ route: GET, chemin, requete, client })
  },
)

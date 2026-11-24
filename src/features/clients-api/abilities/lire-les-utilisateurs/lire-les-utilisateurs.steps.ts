import { When } from '@cucumber/cucumber'
import { GET } from '@/app/api/v1/utilisateurs/route'
import { appelerLApi } from '@/features/clients-api/clients-api.cucumber'

const chemin = '/utilisateurs'

When('un appel sans client API lit les utilisateurs', async () => {
  await appelerLApi({ route: GET, chemin, client: null })
})

When('le client API {string} lit les utilisateurs', async (client: string) => {
  await appelerLApi({ route: GET, chemin, client })
})

When(
  'le client API {string} lit les utilisateurs avec {string}',
  async (client: string, requete: string) => {
    await appelerLApi({ route: GET, chemin, requete, client })
  },
)

import { When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { GET } from '@/app/api/v1/lieux-activite/route'
import { appelerLApi } from '@/features/clients-api/clients-api.cucumber'

const chemin = '/lieux-activite'

When("un appel sans client API lit les lieux d'activité", async () => {
  await appelerLApi({ route: GET, chemin, client: null })
})

When(
  "le client API {string} lit les lieux d'activité",
  async (client: string) => {
    await appelerLApi({ route: GET, chemin, client })
  },
)

When(
  "le client API {string} lit les lieux d'activité avec {string}",
  async (client: string, requete: string) => {
    await appelerLApi({ route: GET, chemin, requete, client })
  },
)

When(
  "le client API {string} demande {int} lieux d'activité par leurs identifiants",
  async (client: string, combien: number) => {
    await appelerLApi({
      route: GET,
      chemin,
      requete: `ids=${Array.from({ length: combien }, () => v4()).join(',')}`,
      client,
    })
  },
)

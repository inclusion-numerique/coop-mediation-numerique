import { creerUnClientApi } from '@/features/clients-api/abilities/creer-un-client-api'
import { NomDuClientApi } from '@/features/clients-api/domain'

export const createApiClient = async ({ nom }: { nom: string }) => {
  const creation = await creerUnClientApi({
    nom: NomDuClientApi(nom),
    portees: [],
    validite: { debut: new Date(), fin: null },
  })

  if (!creation.success) throw new Error('Client API de test non créé')

  return { id: creation.data.client.id, secret: creation.data.secret }
}

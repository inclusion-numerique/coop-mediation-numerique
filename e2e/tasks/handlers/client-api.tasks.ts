import { creerUnClientApi } from '@/features/clients-api/abilities/creer-un-client-api/implementations/prisma/creer-un-client-api.mutation'
import { NomDuClientApi } from '@/features/clients-api/domain'
import { nouveauSecret } from '@/features/clients-api/implementations/secret/secret.adapter'

export const createApiClient = async ({ nom }: { nom: string }) => {
  const creation = await creerUnClientApi(nouveauSecret)({
    nom: NomDuClientApi(nom),
    portees: [],
    validite: { debut: new Date(), fin: null },
  })

  if (!creation.success) throw new Error('Client API de test non créé')

  return { id: creation.data.client.id, secret: creation.data.secret }
}

import { creerUnClientApi } from '@/features/clients-api/abilities/creer-un-client-api/domain/creer-un-client-api'
import { enregistrerLeClientApi } from '@/features/clients-api/abilities/creer-un-client-api/implementations/prisma/enregistrer-le-client-api.mutation'
import { NomDuClientApi } from '@/features/clients-api/domain'
import { nomDejaPris } from '@/features/clients-api/implementations/prisma/nom-deja-pris.query'
import { nouveauSecret } from '@/features/clients-api/implementations/secret/secret.adapter'

export const createApiClient = async ({ nom }: { nom: string }) => {
  const creation = await creerUnClientApi({
    leNomEstPris: nomDejaPris,
    genererUnSecret: nouveauSecret,
    enregistrer: enregistrerLeClientApi,
  })({
    definition: {
      nom: NomDuClientApi(nom),
      portees: [],
      validite: { debut: new Date(), fin: null },
    },
  })

  if (!creation.success) throw new Error('Client API de test non créé')

  return { id: creation.data.client.id, secret: creation.data.secret }
}

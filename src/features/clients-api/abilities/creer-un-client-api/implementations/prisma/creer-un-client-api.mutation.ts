import { prismaClient } from '@/configuration/prisma'
import {
  type ClientApi,
  type DefinitionDuClientApi,
  NomDejaPris,
} from '@/features/clients-api/domain'
import {
  clientApiSelect,
  depuisDefinition,
  versClientApi,
} from '@/features/clients-api/implementations/prisma/client-api.transfer'
import { nomDejaPris } from '@/features/clients-api/implementations/prisma/nom-deja-pris.query'
import { nouveauSecret } from '@/features/clients-api/implementations/secret/secret.adapter'
import { failure, type Result, success } from '@/libraries/result'

export type ClientApiCree = {
  readonly client: ClientApi
  readonly secret: string
}

export const creerUnClientApi = async (
  definition: DefinitionDuClientApi,
): Promise<Result<ClientApiCree, NomDejaPris>> => {
  if (await nomDejaPris(definition.nom))
    return failure(NomDejaPris(definition.nom))

  const { secret, secretHash } = nouveauSecret()
  const ligne = await prismaClient.apiClient.create({
    data: { ...depuisDefinition(definition), secretHash },
    select: clientApiSelect,
  })

  return success({ client: versClientApi(ligne), secret })
}

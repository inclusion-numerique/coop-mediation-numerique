import {
  clientApiSelect,
  depuisDefinition,
  versClientApi,
} from '@/features/clients-api/db/client-api.transfer'
import {
  type ClientApi,
  type DefinitionDuClientApi,
  NomDejaPris,
} from '@/features/clients-api/domain'
import { nomDejaPris } from '@/features/clients-api/implementation/nom-deja-pris'
import { nouveauSecret } from '@/features/clients-api/implementation/secret'
import { failure, type Result, success } from '@/libraries/result'
import { prismaClient } from '@/prismaClient'

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

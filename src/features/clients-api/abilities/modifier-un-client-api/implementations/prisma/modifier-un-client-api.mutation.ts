import { prismaClient } from '@/configuration/prisma/prismaClient'
import {
  clientApiSelect,
  depuisDefinition,
  versClientApi,
} from '@/features/clients-api/db/client-api.transfer'
import {
  type ClientApi,
  ClientApiId,
  ClientApiIntrouvable,
  type DefinitionDuClientApi,
  NomDejaPris,
} from '@/features/clients-api/domain'
import { nomDejaPris } from '@/features/clients-api/implementations/nom-deja-pris'
import { failure, type Result, success } from '@/libraries/result'

export const modifierUnClientApi = async ({
  clientApiId,
  definition,
  maintenant = new Date(),
}: {
  readonly clientApiId: string
  readonly definition: DefinitionDuClientApi
  readonly maintenant?: Date
}): Promise<Result<ClientApi, ClientApiIntrouvable | NomDejaPris>> => {
  const id = ClientApiId.safe(clientApiId)
  const existe =
    id !== null && (await prismaClient.apiClient.count({ where: { id } })) > 0

  if (id === null || !existe) return failure(ClientApiIntrouvable(clientApiId))
  if (await nomDejaPris(definition.nom, id))
    return failure(NomDejaPris(definition.nom))

  const ligne = await prismaClient.apiClient.update({
    where: { id },
    data: { ...depuisDefinition(definition), updated: maintenant },
    select: clientApiSelect,
  })

  return success(versClientApi(ligne))
}

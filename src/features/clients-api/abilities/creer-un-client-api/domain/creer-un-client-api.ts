import {
  type DefinitionDuClientApi,
  NomDejaPris,
} from '@/features/clients-api/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { ClientApiCree } from './client-api-cree'
import type { EchecDeCreerUnClientApi } from './errors'
import type { CreerUnClientApiPorts } from './ports'

export const creerUnClientApi =
  ({ leNomEstPris, genererUnSecret, enregistrer }: CreerUnClientApiPorts) =>
  async ({
    definition,
  }: {
    readonly definition: DefinitionDuClientApi
  }): Promise<Result<ClientApiCree, EchecDeCreerUnClientApi>> => {
    if (await leNomEstPris({ nom: definition.nom, saufClientApiId: null }))
      return failure(NomDejaPris(definition.nom))

    const { secret, secretHash } = genererUnSecret()
    const client = await enregistrer({ definition, secretHash })

    return success({ client, secret, secretHash })
  }

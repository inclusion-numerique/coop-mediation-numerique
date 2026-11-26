import {
  type ClientApi,
  type DefinitionDuClientApi,
  type GenererUnSecret,
  type LeNomEstPris,
  NomDejaPris,
} from '@/features/clients-api/domain'
import { failure, type Result, success } from '@/libraries/result'

export type ClientApiCree = {
  readonly client: ClientApi
  readonly secret: string
}

export type EnregistrerLeClientApi = (nouveau: {
  readonly definition: DefinitionDuClientApi
  readonly secretHash: string
}) => Promise<ClientApi>

export const creerUnClientApi =
  ({
    leNomEstPris,
    genererUnSecret,
    enregistrer,
  }: {
    readonly leNomEstPris: LeNomEstPris
    readonly genererUnSecret: GenererUnSecret
    readonly enregistrer: EnregistrerLeClientApi
  }) =>
  async (
    definition: DefinitionDuClientApi,
  ): Promise<Result<ClientApiCree, NomDejaPris>> => {
    if (await leNomEstPris(definition.nom))
      return failure(NomDejaPris(definition.nom))

    const { secret, secretHash } = genererUnSecret()
    const client = await enregistrer({ definition, secretHash })

    return success({ client, secret })
  }

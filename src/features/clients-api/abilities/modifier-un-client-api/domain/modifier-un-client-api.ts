import {
  type ClientApi,
  type ClientApiExiste,
  ClientApiId,
  ClientApiIntrouvable,
  type DefinitionDuClientApi,
  type LeNomEstPris,
  NomDejaPris,
} from '@/features/clients-api/domain'
import { failure, type Result, success } from '@/libraries/result'

export type EnregistrerLaModification = (modification: {
  readonly id: ClientApiId
  readonly definition: DefinitionDuClientApi
}) => Promise<ClientApi>

export const modifierUnClientApi =
  ({
    clientApiExiste,
    leNomEstPris,
    enregistrer,
  }: {
    readonly clientApiExiste: ClientApiExiste
    readonly leNomEstPris: LeNomEstPris
    readonly enregistrer: EnregistrerLaModification
  }) =>
  async ({
    clientApiId,
    definition,
  }: {
    readonly clientApiId: string
    readonly definition: DefinitionDuClientApi
  }): Promise<Result<ClientApi, ClientApiIntrouvable | NomDejaPris>> => {
    const id = ClientApiId.safe(clientApiId)

    if (id === null || !(await clientApiExiste(id)))
      return failure(ClientApiIntrouvable(clientApiId))
    if (await leNomEstPris(definition.nom, id))
      return failure(NomDejaPris(definition.nom))

    return success(await enregistrer({ id, definition }))
  }

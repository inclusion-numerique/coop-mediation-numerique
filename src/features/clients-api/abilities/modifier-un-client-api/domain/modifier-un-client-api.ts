import {
  type ClientApi,
  ClientApiId,
  ClientApiIntrouvable,
  type DefinitionDuClientApi,
  NomDejaPris,
} from '@/features/clients-api/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDeModifierUnClientApi } from './errors'
import type { ModifierUnClientApiPorts } from './ports'

export const modifierUnClientApi =
  ({ clientApiExiste, leNomEstPris, enregistrer }: ModifierUnClientApiPorts) =>
  async ({
    clientApiId,
    definition,
  }: {
    readonly clientApiId: string
    readonly definition: DefinitionDuClientApi
  }): Promise<Result<ClientApi, EchecDeModifierUnClientApi>> => {
    const id = ClientApiId.safe(clientApiId)

    if (id === null || !(await clientApiExiste(id)))
      return failure(ClientApiIntrouvable(clientApiId))
    if (await leNomEstPris({ nom: definition.nom, saufClientApiId: id }))
      return failure(NomDejaPris(definition.nom))

    return success(await enregistrer({ id, definition }))
  }

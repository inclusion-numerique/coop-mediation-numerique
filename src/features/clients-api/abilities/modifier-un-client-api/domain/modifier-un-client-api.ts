import {
  type ClientApi,
  type ClientApiId,
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
    readonly clientApiId: ClientApiId | null
    readonly definition: DefinitionDuClientApi
  }): Promise<Result<ClientApi, EchecDeModifierUnClientApi>> => {
    if (clientApiId === null || !(await clientApiExiste(clientApiId)))
      return failure(ClientApiIntrouvable())
    if (
      await leNomEstPris({ nom: definition.nom, saufClientApiId: clientApiId })
    )
      return failure(NomDejaPris(definition.nom))

    return success(await enregistrer({ id: clientApiId, definition }))
  }

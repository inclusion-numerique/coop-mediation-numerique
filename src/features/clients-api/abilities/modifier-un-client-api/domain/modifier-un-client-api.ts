import {
  type ClientApiId,
  ClientApiIntrouvable,
  type DefinitionDuClientApi,
  NomDejaPris,
} from '@/features/clients-api/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDeModifierUnClientApi } from './errors'
import type { ModificationDuClientApi } from './modification-du-client-api'
import type { ModifierUnClientApiPorts } from './ports'

export const modifierUnClientApi =
  ({ clientApiExiste, leNomEstPris, enregistrer }: ModifierUnClientApiPorts) =>
  async ({
    clientApiId,
    definition,
    maintenant,
  }: {
    readonly clientApiId: ClientApiId | null
    readonly definition: DefinitionDuClientApi
    readonly maintenant: Date
  }): Promise<Result<ModificationDuClientApi, EchecDeModifierUnClientApi>> => {
    if (clientApiId === null || !(await clientApiExiste(clientApiId)))
      return failure(ClientApiIntrouvable())
    if (
      await leNomEstPris({ nom: definition.nom, saufClientApiId: clientApiId })
    )
      return failure(NomDejaPris(definition.nom))

    const modification = { id: clientApiId, definition, maintenant }
    await enregistrer(modification)

    return success(modification)
  }

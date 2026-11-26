import type { ClientApiId } from './client-api-id'
import type { NomDuClientApi } from './nom-du-client-api'

export type ClientApiExiste = (id: ClientApiId) => Promise<boolean>

export type LeNomEstPris = (
  nom: NomDuClientApi,
  saufClientApiId?: ClientApiId,
) => Promise<boolean>

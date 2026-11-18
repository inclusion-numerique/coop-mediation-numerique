import type { ClientApiId } from './client-api-id'
import type { NomDuClientApi } from './nom-du-client-api'
import type { PeriodeDeValidite } from './periode-de-validite'
import type { PorteeApi } from './portee-api'

export type ClientApi = {
  readonly id: ClientApiId
  readonly nom: NomDuClientApi
  readonly portees: readonly PorteeApi[]
  readonly validite: PeriodeDeValidite
  readonly creeLe: Date
  readonly modifieLe: Date
}

export type DefinitionDuClientApi = Pick<
  ClientApi,
  'nom' | 'portees' | 'validite'
>

export const couvre = (
  client: Pick<ClientApi, 'portees'>,
  portees: readonly PorteeApi[],
): boolean => portees.every((portee) => client.portees.includes(portee))

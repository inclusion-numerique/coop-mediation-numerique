import { type ClientApi, couvre } from './client-api'
import { estValideLe } from './periode-de-validite'
import type { PorteeApi } from './portee-api'

export type IssueDAuthentification =
  | 'Authentifie'
  | 'NonAuthentifie'
  | 'NonAutorise'

export type AuthentifierUnClientApi = (demande: {
  readonly clientApiId: string
  readonly secret: string
  readonly portees: readonly PorteeApi[]
  readonly maintenant?: Date
}) => Promise<IssueDAuthentification>

export const issueDAuthentification = (
  client: Pick<ClientApi, 'portees' | 'validite'>,
  portees: readonly PorteeApi[],
  maintenant: Date,
): IssueDAuthentification =>
  !estValideLe(client.validite, maintenant)
    ? 'NonAuthentifie'
    : couvre(client, portees)
      ? 'Authentifie'
      : 'NonAutorise'

import { type ClientApi, couvre } from './client-api'
import { estValideLe } from './periode-de-validite'
import type { PorteeApi } from './portee-api'

export type IssueDAuthentification =
  | 'Authentifie'
  | 'NonAuthentifie'
  | 'NonAutorise'

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

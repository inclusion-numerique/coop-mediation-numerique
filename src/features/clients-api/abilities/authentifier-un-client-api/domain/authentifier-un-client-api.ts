import {
  ClientApiId,
  couvre,
  estValideLe,
  type PorteeApi,
} from '@/features/clients-api/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { ClientApiAuthentifie } from './client-api-authentifie'
import {
  type EchecDAuthentifierUnClientApi,
  NonAuthentifie,
  NonAutorise,
} from './errors'
import type { AuthentifierUnClientApiPorts } from './ports'

export const authentifierUnClientApi =
  ({
    lireLeClientApiAAuthentifier,
    verifierUnSecret,
  }: AuthentifierUnClientApiPorts) =>
  async ({
    clientApiId,
    secret,
    portees,
    maintenant,
  }: {
    readonly clientApiId: string
    readonly secret: string
    readonly portees: readonly PorteeApi[]
    readonly maintenant: Date
  }): Promise<Result<ClientApiAuthentifie, EchecDAuthentifierUnClientApi>> => {
    const id = ClientApiId.safe(clientApiId)
    const client = id === null ? null : await lireLeClientApiAAuthentifier(id)

    if (client === null || !verifierUnSecret(secret, client.secretHash))
      return failure(NonAuthentifie())
    if (!estValideLe(client.validite, maintenant))
      return failure(NonAuthentifie())
    if (!couvre(client, portees)) return failure(NonAutorise())

    return success({ clientApiId: client.id })
  }

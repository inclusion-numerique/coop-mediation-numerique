import {
  ClientApiId,
  ClientApiIntrouvable,
} from '@/features/clients-api/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDeRenouvelerLeSecret } from './errors'
import type { RenouvelerLeSecretPorts } from './ports'
import type { SecretRenouvele } from './secret-renouvele'

export const renouvelerLeSecret =
  ({
    clientApiExiste,
    genererUnSecret,
    enregistrer,
  }: RenouvelerLeSecretPorts) =>
  async ({
    clientApiId,
  }: {
    readonly clientApiId: string
  }): Promise<Result<SecretRenouvele, EchecDeRenouvelerLeSecret>> => {
    const id = ClientApiId.safe(clientApiId)

    if (id === null || !(await clientApiExiste(id)))
      return failure(ClientApiIntrouvable(clientApiId))

    const { secret, secretHash } = genererUnSecret()
    await enregistrer({ id, secretHash })

    return success({ clientApiId: id, secret, secretHash })
  }

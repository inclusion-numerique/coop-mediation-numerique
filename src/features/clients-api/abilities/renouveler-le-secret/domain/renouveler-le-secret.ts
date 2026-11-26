import {
  type ClientApiExiste,
  ClientApiId,
  ClientApiIntrouvable,
  type GenererUnSecret,
} from '@/features/clients-api/domain'
import { failure, type Result, success } from '@/libraries/result'

export type EnregistrerLeSecret = (renouvellement: {
  readonly id: ClientApiId
  readonly secretHash: string
}) => Promise<void>

export const renouvelerLeSecret =
  ({
    clientApiExiste,
    genererUnSecret,
    enregistrer,
  }: {
    readonly clientApiExiste: ClientApiExiste
    readonly genererUnSecret: GenererUnSecret
    readonly enregistrer: EnregistrerLeSecret
  }) =>
  async ({
    clientApiId,
  }: {
    readonly clientApiId: string
  }): Promise<
    Result<
      { readonly clientApiId: ClientApiId; readonly secret: string },
      ClientApiIntrouvable
    >
  > => {
    const id = ClientApiId.safe(clientApiId)

    if (id === null || !(await clientApiExiste(id)))
      return failure(ClientApiIntrouvable(clientApiId))

    const { secret, secretHash } = genererUnSecret()
    await enregistrer({ id, secretHash })

    return success({ clientApiId: id, secret })
  }

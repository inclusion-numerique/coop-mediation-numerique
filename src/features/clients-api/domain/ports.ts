import type { ClientApiId } from './client-api-id'
import type { NomDuClientApi } from './nom-du-client-api'

export type ClientApiExiste = (id: ClientApiId) => Promise<boolean>

export type LeNomEstPris = (critere: {
  readonly nom: NomDuClientApi
  readonly saufClientApiId: ClientApiId | null
}) => Promise<boolean>

type SecretGenere = {
  readonly secret: string
  readonly secretHash: string
}

export type GenererUnSecret = () => SecretGenere

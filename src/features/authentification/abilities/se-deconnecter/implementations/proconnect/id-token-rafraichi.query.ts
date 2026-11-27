import axios from 'axios'
import {
  proConnectClientId,
  proConnectHostname,
} from '@/features/authentification/implementations/proconnect/proconnect.client'
import { failure, success } from '@/libraries/result'
import { RafraichissementImpossible } from '../../domain/errors'
import type { RafraichirLIdToken } from '../../domain/ports'

const issuer = `https://${proConnectHostname}`

const idTokenDeLaReponse = (idToken: unknown) =>
  typeof idToken === 'string' && idToken.length > 0
    ? success(idToken)
    : failure(RafraichissementImpossible())

export const rafraichirLIdTokenProConnect: RafraichirLIdToken = async (
  refreshToken,
) => {
  try {
    const response = await axios<{ id_token: string }>({
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: proConnectClientId,
        refresh_token: refreshToken,
      }).toString(),
      url: `${issuer}/api/v2/token`,
    })
    return idTokenDeLaReponse(response.data?.id_token)
  } catch {
    return failure(RafraichissementImpossible())
  }
}

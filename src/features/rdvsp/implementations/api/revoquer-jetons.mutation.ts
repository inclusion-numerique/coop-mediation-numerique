import axios from 'axios'
import { failure, messageDe, success } from '@/libraries/result'
import { ApiIndisponible } from '../../domain/errors'
import type { RevoquerJetons } from '../../domain/ports'

export const revoquerJetons =
  ({
    hostname,
    clientId,
    clientSecret,
  }: {
    readonly hostname: string
    readonly clientId: string
    readonly clientSecret: string
  }): RevoquerJetons =>
  async ({ acces, rafraichissement }) => {
    try {
      await axios.post(
        `https://${hostname}/oauth/revoke`,
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          token: rafraichissement ?? acces,
          token_type_hint:
            rafraichissement == null ? 'access_token' : 'refresh_token',
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      )

      return success(undefined)
    } catch (erreur) {
      return failure(
        ApiIndisponible(
          axios.isAxiosError(erreur) ? (erreur.response?.status ?? 500) : 500,
          messageDe(erreur),
        ),
      )
    }
  }

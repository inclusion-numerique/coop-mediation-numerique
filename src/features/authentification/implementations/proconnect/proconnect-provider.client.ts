import { OAuth2Config } from '@auth/core/providers'
import axios from 'axios'
import type { TokenEndpointHandler } from 'next-auth/providers/oauth'
import { environnementServeur } from '@/configuration/environnement/serveur'
import { getServerUrl } from '@/configuration/projet/serveur'
import { telephoneEnregistrable } from '@/libraries/telephone'
import {
  proConnectClientId,
  proConnectHostname,
  proConnectProviderId,
} from './proconnect.client'
import {
  type ProfilProConnect,
  profilProConnectDuJeton,
} from './profil-proconnect.transfer'
import { stateConcordant } from './state-concordant.middleware'

const issuer = `https://${proConnectHostname}`

export const ProConnectProvider = () =>
  ({
    id: proConnectProviderId,
    name: 'ProConnect',
    type: 'oauth',
    allowDangerousEmailAccountLinking: true,
    clientId: proConnectClientId,
    clientSecret: environnementServeur().PROCONNECT_CLIENT_SECRET,
    issuer,
    authorization: {
      url: `${issuer}/api/v2/authorize`,
      params: {
        scope: 'openid given_name usual_name email phone siret',
        acr_values: 'eidas1',
      },
    },
    token: {
      request: async (context: {
        params: {
          code?: string
          state?: string
        }
        checks: {
          state?: string
        }
      }) => {
        if (
          !stateConcordant({
            recu: context.params.state,
            attendu: context.checks.state,
          })
        ) {
          throw new Error('Le state du retour de ProConnect ne concorde pas')
        }
        const body = {
          grant_type: 'authorization_code',
          client_id: proConnectClientId,
          client_secret: environnementServeur().PROCONNECT_CLIENT_SECRET,
          redirect_uri: getServerUrl('/api/auth/callback/proconnect'),
          code: context.params.code || 'undefined',
        }
        const data = new URLSearchParams(body).toString()
        const r = await axios<{
          access_token: string
          expires_in: number
          token_type: 'Bearer'
          scope: string
          refresh_token: string
          id_token: string
        }>({
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          data,
          url: `${issuer}/api/v2/token`,
        })

        return { tokens: r.data }
      },
    } satisfies TokenEndpointHandler,
    userinfo: {
      request: async ({
        tokens,
      }: {
        tokens: {
          access_token?: string
        }
      }) => {
        const r = await axios<string>({
          method: 'GET',
          url: `${issuer}/api/v2/userinfo`,
          headers: {
            Authorization: tokens.access_token
              ? `Bearer ${tokens.access_token}`
              : '',
          },
        })
        return profilProConnectDuJeton(r.data)
      },
    },
    profile: ({ email, sub, given_name, usual_name, phone_number, siret }) => ({
      id: sub,
      name: `${given_name} ${usual_name}`.trim(),
      firstName: given_name,
      lastName: usual_name,
      email: email.toLowerCase(),
      phone: telephoneEnregistrable(phone_number),
      siret: siret || null,
      provider: proConnectProviderId,
    }),
  }) satisfies OAuth2Config<ProfilProConnect>

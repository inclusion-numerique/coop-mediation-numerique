import type { NextRequest } from 'next/server'
import { getServerBaseUrl, getServerUrl } from '@/configuration/projet/baseUrl'
import { supprimerSession } from '@/features/authentification/abilities/se-deconnecter/implementations/prisma/index'
import type { ProconnectSignoutState } from '@/features/authentification/implementations/proconnect/proconnect-signout'
import {
  getSessionTokenFromNextRequestCookies,
  secureSessionCookie,
  sessionCookie,
} from '@/features/authentification/implementations/session/session-token-from-cookies'
import { getSessionUserFromSessionToken } from '@/features/authentification/implementations/session/session-user-from-session-token'
import {
  decodeSerializableState,
  type EncodedState,
} from '@/libraries/parametres-d-url/encodeSerializableState'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const cookiesEffaces = [
  `${secureSessionCookie}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
  `${sessionCookie}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
]

const cheminDeLApplication = (adresse: string): string => {
  const base = getServerBaseUrl({ absolutePath: true })
  return adresse.startsWith(`${base}/`) ? adresse.slice(base.length) : adresse
}

const destinationApresDeconnexion = (callbackUrl: string) =>
  getServerUrl(cheminDeLApplication(callbackUrl), { absolutePath: true })

export const GET = async (request: NextRequest) => {
  const { state } = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  ) as { state: EncodedState<ProconnectSignoutState> }

  const decodedState = decodeSerializableState(state, {
    callbackUrl: '/',
    nonce: '',
  })

  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = await getSessionUserFromSessionToken(sessionToken)

  if (!sessionToken || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  await supprimerSession(sessionToken)

  return new Response('OK', {
    status: 303,
    headers: [
      ['location', destinationApresDeconnexion(decodedState.callbackUrl)],
      ...cookiesEffaces.map((cookie): [string, string] => [
        'Set-Cookie',
        cookie,
      ]),
    ],
  })
}

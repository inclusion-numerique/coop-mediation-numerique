import type { NextRequest } from 'next/server'
import { supprimerSession } from '@/features/authentification/abilities/se-deconnecter'
import type { ProconnectSignoutState } from '@/features/authentification/implementation/proconnect/proconnectSignout'
import {
  getSessionTokenFromNextRequestCookies,
  secureSessionCookie,
  sessionCookie,
} from '@/features/authentification/implementation/session/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@/features/authentification/implementation/session/getSessionUserFromSessionToken'
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
      ['location', decodedState.callbackUrl],
      ...cookiesEffaces.map((cookie): [string, string] => [
        'Set-Cookie',
        cookie,
      ]),
    ],
  })
}

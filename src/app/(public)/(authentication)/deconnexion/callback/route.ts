import type { NextRequest } from 'next/server'
import { getServerBaseUrl, getServerUrl } from '@/configuration/projet/base-url'
import { supprimerSession } from '@/features/authentification/abilities/se-deconnecter/implementations/prisma/index'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import type { ProconnectSignoutState } from '@/features/authentification/implementations/proconnect/proconnect-signout.transfer'
import {
  jetonDeSessionDesCookies,
  secureSessionCookie,
  sessionCookie,
} from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import {
  decodeSerializableState,
  type EncodedState,
} from '@/libraries/etat-encode/encode-serializable-state'

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

  const sessionToken = jetonDeSessionDesCookies(request.cookies)
  const user = await utilisateurDuJetonDeSession(sessionToken)

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

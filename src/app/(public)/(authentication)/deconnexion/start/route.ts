import type { NextRequest } from 'next/server'
import { v4 } from 'uuid'
import { getServerUrl } from '@/configuration/projet/baseUrl'
import { idTokenPourDeconnexion } from '@/features/authentification/abilities/se-deconnecter'
import type { ProconnectSignoutState } from '@/features/authentification/implementation/proconnect/proconnectSignout'
import { generateProconnectSignoutUrl } from '@/features/authentification/implementation/proconnect/proconnectSignout'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementation/session/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@/features/authentification/implementation/session/getSessionUserFromSessionToken'
import {
  type EncodedState,
  encodeSerializableState,
} from '@/libraries/parametres-d-url/encodeSerializableState'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const redirectionVers = (location: string) =>
  new Response('OK', { status: 303, headers: { location } })

export const GET = async (request: NextRequest) => {
  const callbackUrlRaw = request.nextUrl.searchParams.get('callbackUrl') || '/'

  const callbackUrl = callbackUrlRaw.startsWith('http')
    ? callbackUrlRaw
    : getServerUrl(callbackUrlRaw, { absolutePath: true })

  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = sessionToken
    ? await getSessionUserFromSessionToken(sessionToken)
    : null

  if (!user) return redirectionVers(callbackUrl)

  const idTokenHint = await idTokenPourDeconnexion(user.id)

  if (idTokenHint) {
    return redirectionVers(
      generateProconnectSignoutUrl({ callbackUrl, idTokenHint }),
    )
  }

  const state = encodeSerializableState<ProconnectSignoutState>({
    callbackUrl,
    nonce: v4(),
  }) as EncodedState<ProconnectSignoutState>

  return redirectionVers(
    getServerUrl(`/deconnexion/callback?state=${encodeURIComponent(state)}`, {
      absolutePath: true,
    }),
  )
}

import type { NextRequest } from 'next/server'
import { v4 } from 'uuid'
import { getServerUrl } from '@/configuration/projet/base-url'
import { idTokenPourDeconnexion } from '@/features/authentification/abilities/se-deconnecter/implementations/proconnect/se-deconnecter.query'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import type { ProconnectSignoutState } from '@/features/authentification/implementations/proconnect/proconnect-signout.transfer'
import { generateProconnectSignoutUrl } from '@/features/authentification/implementations/proconnect/proconnect-signout.transfer'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { cheminInterne } from '@/libraries/chemin-interne'
import {
  type EncodedState,
  encodeSerializableState,
} from '@/libraries/etat-encode/encode-serializable-state'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const redirectionVers = (location: string) =>
  new Response('OK', { status: 303, headers: { location } })

export const GET = async (request: NextRequest) => {
  const callbackUrl = getServerUrl(
    cheminInterne(request.nextUrl.searchParams.get('callbackUrl')),
    { absolutePath: true },
  )

  const sessionToken = jetonDeSessionDesCookies(request.cookies)
  const user = sessionToken
    ? await utilisateurDuJetonDeSession(sessionToken)
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

import type { NextRequest } from 'next/server'
import { v4 } from 'uuid'
import {
  connexionParProConnect,
  getServerUrl,
} from '@/configuration/projet/serveur'
import { seDeconnecter } from '@/features/authentification/abilities/se-deconnecter/domain/se-deconnecter'
import { lireLesJetonsDuFournisseur } from '@/features/authentification/abilities/se-deconnecter/implementations/prisma'
import { rafraichirLIdTokenProConnect } from '@/features/authentification/abilities/se-deconnecter/implementations/proconnect/id-token-rafraichi.query'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { proConnectProviderId } from '@/features/authentification/implementations/proconnect/proconnect.client'
import type { ProconnectSignoutState } from '@/features/authentification/implementations/proconnect/proconnect-signout.transfer'
import { generateProconnectSignoutUrl } from '@/features/authentification/implementations/proconnect/proconnect-signout.transfer'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { cheminInterne } from '@/libraries/chemin-interne'
import {
  type EncodedState,
  encodeSerializableState,
} from '@/libraries/etat-encode'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const redirectionVers = (location: string) =>
  new Response('OK', { status: 303, headers: { location } })

const idTokenHintDeProConnect = async (
  utilisateurId: string,
): Promise<string | null> => {
  const deconnexion = await seDeconnecter({
    lireLesJetonsProconnect: lireLesJetonsDuFournisseur(proConnectProviderId),
    rafraichirLIdToken: rafraichirLIdTokenProConnect,
  })({ utilisateurId, maintenant: new Date() })
  return deconnexion.success && deconnexion.data._tag === 'AupresDeProConnect'
    ? deconnexion.data.idTokenHint
    : null
}

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

  const idTokenHint = connexionParProConnect()
    ? await idTokenHintDeProConnect(user.id)
    : null

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

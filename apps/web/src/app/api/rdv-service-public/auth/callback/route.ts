import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import {
  CODE_AUTORISATION_MANQUANT,
  CONNECTER_COMPTE_RDV_ERRORS,
  type MotifEchecConnexion,
} from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/action/connecter-compte-rdv.errors'
import { CodeAutorisation } from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/domain/code-autorisation'
import { connecterCompteRdvBinding } from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/implementation/connecter-compte-rdv.binding'
import { declencherSynchronisationBinding } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/implementation/declencher-synchronisation.binding'
import { EmailExterne } from '@app/web/features/rdvsp/domain/identite'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { getServerUrl } from '@app/web/utils/baseUrl'
import {
  decodeSerializableState,
  type EncodedState,
} from '@app/web/utils/encodeSerializableState'
import * as Sentry from '@sentry/nextjs'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type DestinationsDeRetour = {
  redirectToSuccess?: string
  redirectToError?: string
}

const redirection = (chemin: string, motif?: MotifEchecConnexion) =>
  NextResponse.redirect(
    getServerUrl(
      motif === undefined
        ? chemin
        : `${chemin}?${new URLSearchParams({ ...motif }).toString()}`,
      { absolutePath: true },
    ),
  )

/**
 * Route de retour du parcours OAuth de RDV Service Public.
 *
 * Elle ne fait plus que ce qu'une route doit faire : authentifier la session,
 * lire les paramètres de l'URL, appeler la feature, rediriger. L'échange de
 * jetons, l'identification de l'agent, le contrôle d'adresse et l'écriture du
 * compte vivent dans l'ability `connecter-compte-rdv` ; les codes rendus à
 * l'écran de retour, dans sa couche `action`.
 */
export const GET = async (request: NextRequest) => {
  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = await getSessionUserFromSessionToken(sessionToken)

  if (!sessionToken || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const state = request.nextUrl.searchParams.get('state')

  if (!state) {
    return NextResponse.json(
      { error: 'Missing state parameter' },
      { status: 400 },
    )
  }

  const destinations = decodeSerializableState(
    state as EncodedState<DestinationsDeRetour>,
    {},
  )

  const succes = destinations.redirectToSuccess ?? '/coop'
  const echec = destinations.redirectToError ?? '/coop'

  // Refus de l'utilisateur ou panne côté fournisseur : aucun code n'arrivera, le
  // motif est relayé tel quel.
  const refus = request.nextUrl.searchParams.get('error')

  if (refus) {
    return redirection(echec, {
      error: refus,
      error_description:
        request.nextUrl.searchParams.get('error_description') ?? '',
    })
  }

  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    return redirection(echec, CODE_AUTORISATION_MANQUANT)
  }

  const utilisateurId = UtilisateurCoopId(user.id)

  const connexion = await connecterCompteRdvBinding({
    utilisateurId,
    emailUtilisateur: EmailExterne(user.email),
    code: CodeAutorisation(code),
  })

  if (!connexion.success) {
    Sentry.captureException?.(
      new Error(`Liaison RDV Service Public refusée : ${connexion.error._tag}`),
    )

    return redirection(echec, CONNECTER_COMPTE_RDV_ERRORS[connexion.error._tag])
  }

  // Première synchronisation en tâche de fond : elle peut durer plusieurs
  // minutes, l'utilisateur n'a pas à l'attendre pour être redirigé. L'ability
  // relit le compte qui vient d'être écrit — la route n'a pas à le lui passer.
  declencherSynchronisationBinding({
    demandeur: { id: utilisateurId, role: user.role },
    utilisateurId,
    seulementSansWebhook: false,
  }).catch((erreur: unknown) => Sentry.captureException?.(erreur))

  return redirection(succes)
}

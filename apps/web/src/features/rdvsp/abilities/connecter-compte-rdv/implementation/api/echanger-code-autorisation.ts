import { failure, success } from '@app/web/libraries/result'
import axios from 'axios'
import { z } from 'zod'
import {
  JetonAcces,
  JetonRafraichissement,
  PorteeOAuth,
} from '../../../../domain/jetons-oauth'
import type { EchangerCodeAutorisation } from '../../domain/connecter-compte-rdv'
import { CodeAutorisationRefuse } from '../../domain/errors'

const reponseJetons = z.object({
  access_token: z.string().min(1),
  refresh_token: z
    .string()
    .nullish()
    .transform((valeur) => valeur ?? null),
  expires_in: z.number(),
  scope: z
    .string()
    .nullish()
    .transform((valeur) => valeur ?? null),
})

export type EchangerCodeAutorisationConfig = {
  readonly hostname: string
  readonly clientId: string
  readonly clientSecret: string
  readonly redirectUri: string
  readonly maintenant?: () => Date
}

/**
 * Échange le code d'autorisation contre le premier jeu de jetons.
 *
 * Cet appel ne passe pas par le port `RdvServicePublicApi` : il ne s'authentifie
 * pas avec un compte — il en crée les conditions — et vise l'endpoint OAuth, non
 * l'API métier. Seule cette ability en a l'usage, il vit donc chez elle.
 */
export const echangerCodeAutorisation =
  ({
    hostname,
    clientId,
    clientSecret,
    redirectUri,
    maintenant = () => new Date(),
  }: EchangerCodeAutorisationConfig): EchangerCodeAutorisation =>
  async (code) => {
    try {
      const reponse = await axios.post(
        `https://${hostname}/oauth/token`,
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          code,
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      )

      const analyse = reponseJetons.safeParse(reponse.data)

      if (!analyse.success) {
        return failure(
          CodeAutorisationRefuse(
            'Réponse inattendue du service de jetons RDV Service Public',
          ),
        )
      }

      const { access_token, refresh_token, expires_in, scope } = analyse.data

      return success({
        acces: JetonAcces(access_token),
        rafraichissement:
          refresh_token === null ? null : JetonRafraichissement(refresh_token),
        expiration: new Date(maintenant().getTime() + expires_in * 1000),
        portee: scope === null ? null : PorteeOAuth(scope),
      })
    } catch (erreur) {
      return failure(
        CodeAutorisationRefuse(
          axios.isAxiosError(erreur)
            ? (erreur.response?.data?.error_description ?? erreur.message)
            : 'Erreur inconnue',
        ),
      )
    }
  }

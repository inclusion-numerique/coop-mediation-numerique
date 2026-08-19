import { failure, success } from '@app/web/libraries/result'
import { usagerPayload } from '../../../../implementation/api/payloads'
import { usagerToDomain } from '../../../../implementation/api/to-domain'
import type { LireNotificationUsager } from '../../domain/recevoir-webhook-usager'

/**
 * La notification d'usager reprend la forme de l'API. Elle omet la caisse
 * d'affiliation, que le schéma tient déjà pour facultative : rien à normaliser
 * ici, contrairement aux notifications de rendez-vous.
 */
export const lireNotificationUsager: LireNotificationUsager = (payload) => {
  const analyse = usagerPayload.safeParse(payload)

  return analyse.success
    ? success(usagerToDomain(analyse.data))
    : failure('payloadInexploitable')
}

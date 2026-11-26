import { failure, success } from '@/libraries/result'
import { usagerPayload } from '../../../../implementations/api/rdv-service-public.payload'
import { usagerToDomain } from '../../../../implementations/api/rdv-service-public.transfer'
import { PayloadInexploitable } from '../../domain/errors'
import type { LireNotificationUsager } from '../../domain/ports'

/**
 * La notification d'usager reprend la forme de l'API. Elle omet la caisse
 * d'affiliation, que le schéma tient déjà pour facultative : rien à normaliser
 * ici, contrairement aux notifications de rendez-vous.
 */
export const lireNotificationUsager: LireNotificationUsager = (payload) => {
  const analyse = usagerPayload.safeParse(payload)

  return analyse.success
    ? success(usagerToDomain(analyse.data))
    : failure(PayloadInexploitable())
}

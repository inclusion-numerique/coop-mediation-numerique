import { failure, success } from '@/libraries/result'
import { PayloadInexploitable } from '../../../../domain/errors'
import { usagerPayload } from '../../../../implementations/api/rdv-service-public.payload'
import { usagerToDomain } from '../../../../implementations/api/rdv-service-public.transfer'
import type { LireNotificationUsager } from '../../domain/ports'

export const lireNotificationUsager: LireNotificationUsager = (payload) => {
  const analyse = usagerPayload.safeParse(payload)

  return analyse.success
    ? success(usagerToDomain(analyse.data))
    : failure(PayloadInexploitable())
}

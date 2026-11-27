import { z } from 'zod'
import { failure, success } from '@/libraries/result'
import { PayloadInexploitable } from '../../../../domain/errors'
import { RdvAgentId } from '../../../../domain/identifiants/rdv-agent-id'
import { rdvPayload } from '../../../../implementations/api/rdv-service-public.payload'
import { rdvToDomain } from '../../../../implementations/api/rdv-service-public.transfer'
import { AucunAgent } from '../../domain/errors'
import type { LireNotificationRdv } from '../../domain/ports'

const avecMotif = z.looseObject({ motif: z.looseObject({}) })

const sansCategorieDeMotif = (payload: unknown): unknown => {
  const lu = avecMotif.safeParse(payload)

  return lu.success
    ? { ...lu.data, motif: { ...lu.data.motif, motif_category: null } }
    : payload
}

const notificationRdv = z.preprocess(
  sansCategorieDeMotif,
  rdvPayload.extend({
    agents: z.array(z.object({ id: z.number().int() })).default([]),
  }),
)

export const lireNotificationRdv: LireNotificationRdv = (payload) => {
  const analyse = notificationRdv.safeParse(payload)

  if (!analyse.success) {
    return failure(PayloadInexploitable())
  }

  const agent = analyse.data.agents.at(0)

  if (agent === undefined) {
    return failure(AucunAgent())
  }

  const agentId = RdvAgentId(agent.id)

  return success({ agentId, rdv: rdvToDomain(analyse.data, agentId) })
}

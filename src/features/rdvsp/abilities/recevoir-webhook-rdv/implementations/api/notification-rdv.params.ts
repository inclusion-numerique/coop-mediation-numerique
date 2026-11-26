import { z } from 'zod'
import { failure, success } from '@/libraries/result'
import { PayloadInexploitable } from '../../../../domain/errors'
import { RdvAgentId } from '../../../../domain/identifiants/rdv-agent-id'
import { rdvPayload } from '../../../../implementations/api/rdv-service-public.payload'
import { rdvToDomain } from '../../../../implementations/api/rdv-service-public.transfer'
import { AucunAgent } from '../../domain/errors'
import type { LireNotificationRdv } from '../../domain/ports'

const sansCategorieDeMotif = (payload: unknown): unknown => {
  if (typeof payload !== 'object' || payload === null) {
    return payload
  }

  const { motif } = payload as { motif?: unknown }

  return typeof motif === 'object' && motif !== null
    ? { ...payload, motif: { ...motif, motif_category: null } }
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

import { failure, success } from '@app/web/libraries/result'
import { z } from 'zod'
import { RdvAgentId } from '../../../../domain/rdv-agent-id'
import { rdvPayload } from '../../../../implementation/api/payloads'
import { rdvToDomain } from '../../../../implementation/api/to-domain'
import type { LireNotificationRdv } from '../../domain/recevoir-webhook-rdv'

/**
 * La notification reprend la forme d'un rendez-vous de l'API, à deux écarts près.
 *
 * Elle porte la liste des agents concernés — c'est le seul lien avec un compte
 * de La Coop. Et sa catégorie de motif est une chaîne là où l'API rend un objet ;
 * on la ramène à l'absence plutôt que d'inventer un identifiant, comme le faisait
 * déjà le code d'origine.
 */
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
    return failure('payloadInexploitable')
  }

  const agent = analyse.data.agents.at(0)

  if (agent === undefined) {
    return failure('aucunAgent')
  }

  const agentId = RdvAgentId(agent.id)

  return success({ agentId, rdv: rdvToDomain(analyse.data, agentId) })
}

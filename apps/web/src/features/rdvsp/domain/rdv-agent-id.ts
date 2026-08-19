import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Identifiant de l'agent côté RDV Service Public. C'est également la clé
 * primaire de `rdv_accounts` : un compte RDV n'existe dans La Coop que parce
 * qu'un agent existe en face.
 */
export const RdvAgentId = defineModel(
  z.number().int().positive().brand('RdvAgentId'),
)

export type RdvAgentId = Model.TypeOf<typeof RdvAgentId>

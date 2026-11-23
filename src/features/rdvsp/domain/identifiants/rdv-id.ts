import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

/**
 * Identifiant d'un rendez-vous côté RDV Service Public. La Coop ne génère aucun
 * identifiant propre : l'id externe est aussi la clé primaire de `rdvs`.
 */
export const RdvId = defineModel(z.number().int().positive().brand('RdvId'))

export type RdvId = Model.TypeOf<typeof RdvId>

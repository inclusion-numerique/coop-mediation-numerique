import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

/** Identifiant d'un motif de rendez-vous côté RDV Service Public. */
export const MotifId = defineModel(z.number().int().positive().brand('MotifId'))

export type MotifId = Model.TypeOf<typeof MotifId>

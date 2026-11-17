import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/** Identifiant d'un motif de rendez-vous côté RDV Service Public. */
export const MotifId = defineModel(z.number().int().positive().brand('MotifId'))

export type MotifId = Model.TypeOf<typeof MotifId>

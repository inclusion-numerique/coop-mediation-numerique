import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import { type StatutPresence, statutsPresence } from './statut-presence'

export const statutsRdv = [...statutsPresence, 'passe'] as const

export const StatutRdv = defineModel(z.enum(statutsRdv).brand('StatutRdv'))

export type StatutRdv = Model.TypeOf<typeof StatutRdv>

export const statutRdv = (
  statutPresence: StatutPresence,
  fin: Date,
  maintenant: Date,
): StatutRdv =>
  statutPresence === 'unknown' && fin.getTime() <= maintenant.getTime()
    ? StatutRdv('passe')
    : StatutRdv(statutPresence)

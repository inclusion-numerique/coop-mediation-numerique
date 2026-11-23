import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const CoordinateurId = defineModel(z.guid().brand('CoordinateurId'))

export type CoordinateurId = Model.TypeOf<typeof CoordinateurId>

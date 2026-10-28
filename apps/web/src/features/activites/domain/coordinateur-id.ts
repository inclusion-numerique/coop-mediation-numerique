import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const CoordinateurId = defineModel(z.guid().brand('CoordinateurId'))

export type CoordinateurId = Model.TypeOf<typeof CoordinateurId>

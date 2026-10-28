import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomDeTag = defineModel(z.string().trim().min(1).brand('NomDeTag'))

export type NomDeTag = Model.TypeOf<typeof NomDeTag>

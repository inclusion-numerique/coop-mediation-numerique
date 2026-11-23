import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NomDeTag = defineModel(z.string().trim().min(1).brand('NomDeTag'))

export type NomDeTag = Model.TypeOf<typeof NomDeTag>

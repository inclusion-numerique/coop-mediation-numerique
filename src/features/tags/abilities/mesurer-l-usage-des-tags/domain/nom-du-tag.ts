import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NomDuTag = defineModel(z.string().trim().min(1).brand('NomDuTag'))

export type NomDuTag = Model.TypeOf<typeof NomDuTag>

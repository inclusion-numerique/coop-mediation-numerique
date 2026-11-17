import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const LienAgent = defineModel(z.url().brand('LienAgent'))

export type LienAgent = Model.TypeOf<typeof LienAgent>

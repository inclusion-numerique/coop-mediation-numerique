import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const LienAgent = defineModel(z.url().brand('LienAgent'))

export type LienAgent = Model.TypeOf<typeof LienAgent>

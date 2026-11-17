import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const LienDePartageId = defineModel(z.guid().brand('LienDePartageId'))

export type LienDePartageId = Model.TypeOf<typeof LienDePartageId>

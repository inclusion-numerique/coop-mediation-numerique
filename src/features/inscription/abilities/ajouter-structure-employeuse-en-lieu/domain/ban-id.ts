import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const BanId = defineModel(z.string().trim().min(1).brand('BanId'))

export type BanId = Model.TypeOf<typeof BanId>

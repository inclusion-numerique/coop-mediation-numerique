import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const BanId = defineModel(z.string().trim().min(1).brand('BanId'))

export type BanId = Model.TypeOf<typeof BanId>

import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Email = defineModel(z.string().trim().min(1).brand('Email'))

export type Email = Model.TypeOf<typeof Email>

import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Email = defineModel(z.string().trim().min(1).brand('Email'))

export type Email = Model.TypeOf<typeof Email>

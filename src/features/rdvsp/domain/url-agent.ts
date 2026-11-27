import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const UrlAgent = defineModel(z.url().brand('UrlAgent'))

export type UrlAgent = Model.TypeOf<typeof UrlAgent>

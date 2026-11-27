import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const CodeAutorisation = defineModel(
  z.string().trim().min(1).brand('CodeAutorisation'),
)

export type CodeAutorisation = Model.TypeOf<typeof CodeAutorisation>

import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const IdentifiantCartographie = defineModel(
  z.string().trim().min(1).brand('IdentifiantCartographie'),
)

export type IdentifiantCartographie = Model.TypeOf<
  typeof IdentifiantCartographie
>

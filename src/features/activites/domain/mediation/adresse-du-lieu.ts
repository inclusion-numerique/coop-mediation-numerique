import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const AdresseDuLieu = defineModel(
  z.string().trim().min(1).brand('AdresseDuLieu'),
)

export type AdresseDuLieu = Model.TypeOf<typeof AdresseDuLieu>

import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const AdresseDuLieu = defineModel(
  z.string().trim().min(1).brand('AdresseDuLieu'),
)

export type AdresseDuLieu = Model.TypeOf<typeof AdresseDuLieu>

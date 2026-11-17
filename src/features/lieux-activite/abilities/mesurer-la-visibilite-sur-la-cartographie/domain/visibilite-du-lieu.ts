import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const VisibiliteDuLieu = defineModel(
  z.enum(['Visible', 'Masque']).brand('VisibiliteDuLieu'),
)

export type VisibiliteDuLieu = Model.TypeOf<typeof VisibiliteDuLieu>

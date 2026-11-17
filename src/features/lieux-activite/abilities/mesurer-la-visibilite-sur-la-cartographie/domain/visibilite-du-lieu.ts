import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const VisibiliteDuLieu = defineModel(
  z.enum(['Visible', 'Masque']).brand('VisibiliteDuLieu'),
)

export type VisibiliteDuLieu = Model.TypeOf<typeof VisibiliteDuLieu>

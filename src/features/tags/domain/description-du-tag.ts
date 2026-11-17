import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const DescriptionDuTag = defineModel(
  z.string().trim().min(1).brand('DescriptionDuTag'),
)

export type DescriptionDuTag = Model.TypeOf<typeof DescriptionDuTag>

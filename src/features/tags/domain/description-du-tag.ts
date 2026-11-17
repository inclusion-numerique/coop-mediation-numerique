import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const DescriptionDuTag = defineModel(
  z.string().trim().min(1).brand('DescriptionDuTag'),
)

export type DescriptionDuTag = Model.TypeOf<typeof DescriptionDuTag>

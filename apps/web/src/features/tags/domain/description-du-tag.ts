import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const DESCRIPTION_DU_TAG_LONGUEUR_MAX = 280

export const DescriptionDuTag = defineModel(
  z.string().trim().min(1).brand('DescriptionDuTag'),
)

export type DescriptionDuTag = Model.TypeOf<typeof DescriptionDuTag>

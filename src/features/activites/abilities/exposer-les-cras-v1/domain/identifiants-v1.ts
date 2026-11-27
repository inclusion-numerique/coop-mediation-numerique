import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const CraV1Id = defineModel(z.string().min(1).brand('CraV1Id'))

export type CraV1Id = Model.TypeOf<typeof CraV1Id>

export const ConseillerNumeriqueV1Id = defineModel(
  z.string().min(1).brand('ConseillerNumeriqueV1Id'),
)

export type ConseillerNumeriqueV1Id = Model.TypeOf<
  typeof ConseillerNumeriqueV1Id
>

export const StructureV1Id = defineModel(
  z.string().min(1).brand('StructureV1Id'),
)

export type StructureV1Id = Model.TypeOf<typeof StructureV1Id>

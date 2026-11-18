import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const inscriptionFlowTypes = [
  'withDataspace',
  'withoutDataspace',
] as const

export const InscriptionFlowType = defineModel(
  z.enum(inscriptionFlowTypes).brand('InscriptionFlowType'),
)

export type InscriptionFlowType = Model.TypeOf<typeof InscriptionFlowType>

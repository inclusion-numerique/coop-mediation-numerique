import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const inscriptionFlowTypes = [
  'withDataspace',
  'withoutDataspace',
] as const

export const InscriptionFlowType = defineModel(
  z.enum(inscriptionFlowTypes).brand('InscriptionFlowType'),
)

export type InscriptionFlowType = Model.TypeOf<typeof InscriptionFlowType>

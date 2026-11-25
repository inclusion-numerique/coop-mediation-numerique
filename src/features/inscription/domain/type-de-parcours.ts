import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const inscriptionFlowTypes = ['withDataspace', 'withoutDataspace'] as const

export const TypeDeParcours = defineModel(
  z.enum(inscriptionFlowTypes).brand('InscriptionFlowType'),
)

export type TypeDeParcours = Model.TypeOf<typeof TypeDeParcours>

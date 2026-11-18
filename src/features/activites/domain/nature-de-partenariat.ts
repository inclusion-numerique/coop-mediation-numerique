import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NatureDePartenariat = defineModel(
  z
    .enum([
      'ParcoursUsager',
      'Subvention',
      'CoordinationDepartementale',
      'RDVElu',
    ])
    .brand('NatureDePartenariat'),
)

export type NatureDePartenariat = Model.TypeOf<typeof NatureDePartenariat>

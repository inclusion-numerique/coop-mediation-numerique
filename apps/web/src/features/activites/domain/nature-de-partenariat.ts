import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

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

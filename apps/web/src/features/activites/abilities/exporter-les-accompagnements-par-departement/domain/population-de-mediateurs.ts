import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const PopulationDeMediateurs = defineModel(
  z
    .enum(['ConseillersNumeriques', 'AutresMediateurs'])
    .brand('PopulationDeMediateurs'),
)

export type PopulationDeMediateurs = Model.TypeOf<typeof PopulationDeMediateurs>

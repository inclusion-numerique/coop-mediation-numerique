import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const PopulationDeMediateurs = defineModel(
  z
    .enum(['ConseillersNumeriques', 'AutresMediateurs'])
    .brand('PopulationDeMediateurs'),
)

export type PopulationDeMediateurs = Model.TypeOf<typeof PopulationDeMediateurs>

import { z } from 'zod'
import { RdvId } from '../../../domain/rdv-id'

export const CreerActiviteDepuisRdvValidation = z.object({
  rdvId: RdvId.schema,
})

export type CreerActiviteDepuisRdvInput = z.infer<
  typeof CreerActiviteDepuisRdvValidation
>

import { z } from 'zod'
import { RdvId } from '../../../domain/identifiants/rdv-id'

export const CreerActiviteDepuisRdvValidation = z.object({
  rdvId: RdvId.schema,
})

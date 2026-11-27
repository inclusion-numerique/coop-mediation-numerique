import { z } from 'zod'
import { BeneficiaireCibleId } from '../domain/beneficiaire-cible'

export const PrendreRendezVousValidation = z.object({
  beneficiaireId: BeneficiaireCibleId.schema,
})

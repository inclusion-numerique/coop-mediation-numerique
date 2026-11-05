import { z } from 'zod'
import { reponsesApresRupture } from '../domain/reponse-apres-rupture'

export const ConfirmerLExerciceApresRuptureValidation = z.object({
  reponse: z.enum(reponsesApresRupture),
})

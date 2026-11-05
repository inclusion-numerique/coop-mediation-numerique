import { z } from 'zod'
import { reponsesApresRupture } from '../domain/reponse-apres-rupture'

export const ChoisirLaVisibiliteApresRuptureValidation = z.object({
  reponse: z.enum(reponsesApresRupture),
})

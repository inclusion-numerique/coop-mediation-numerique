import {
  auMoinsUnServiceSiVisible,
  CreerLieuShape,
} from '@app/web/features/lieux-activite/formulaire/CreerLieuShape'
import z from 'zod'

export const CreerLieuActiviteValidation = z
  .object(CreerLieuShape)
  .refine(...auMoinsUnServiceSiVisible)

export type CreerLieuActiviteData = z.infer<typeof CreerLieuActiviteValidation>

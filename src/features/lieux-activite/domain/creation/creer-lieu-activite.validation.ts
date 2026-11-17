import z from 'zod'
import {
  auMoinsUnServiceSiVisible,
  CreerLieuShape,
} from '@/features/lieux-activite/domain/creation/creer-lieu.shape'
import {
  adresseReconnue,
  commentaireAdosseAUnCreneau,
} from '@/features/lieux-activite/domain/regles-de-saisie'

export const CreerLieuActiviteValidation = z
  .object(CreerLieuShape)
  .refine(...auMoinsUnServiceSiVisible)
  .refine(...commentaireAdosseAUnCreneau)
  .refine(...adresseReconnue)

export type CreerLieuActiviteData = z.infer<typeof CreerLieuActiviteValidation>

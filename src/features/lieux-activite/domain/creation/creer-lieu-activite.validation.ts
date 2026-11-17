import {
  auMoinsUnServiceSiVisible,
  CreerLieuShape,
} from '@app/web/features/lieux-activite/domain/creation/creer-lieu.shape'
import {
  adresseReconnue,
  commentaireAdosseAUnCreneau,
} from '@app/web/features/lieux-activite/domain/regles-de-saisie'
import z from 'zod'

export const CreerLieuActiviteValidation = z
  .object(CreerLieuShape)
  .refine(...auMoinsUnServiceSiVisible)
  .refine(...commentaireAdosseAUnCreneau)
  .refine(...adresseReconnue)

export type CreerLieuActiviteData = z.infer<typeof CreerLieuActiviteValidation>

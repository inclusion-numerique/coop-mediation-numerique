import {
  adresseReconnue,
  commentaireAdosseAUnCreneau,
} from '@app/web/features/lieux-activite/domain/regles-de-saisie'
import {
  auMoinsUnServiceSiVisible,
  CreerLieuShape,
} from '@app/web/features/lieux-activite/formulaire/CreerLieuShape'
import z from 'zod'

export const CreerLieuActiviteValidation = z
  .object(CreerLieuShape)
  .refine(...auMoinsUnServiceSiVisible)
  .refine(...commentaireAdosseAUnCreneau)
  .refine(...adresseReconnue)

export type CreerLieuActiviteData = z.infer<typeof CreerLieuActiviteValidation>

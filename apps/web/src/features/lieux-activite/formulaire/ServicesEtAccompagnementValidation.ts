import * as vocabulaire from '@app/web/features/lieux-activite/vocabulaire'
import z from 'zod'

export const ServicesEtAccompagnementShape = {
  services: z.array(z.enum(vocabulaire.service.valeurs)).nullish(),
  modalitesAccompagnement: z
    .array(z.enum(vocabulaire.modaliteAccompagnement.valeurs))
    .nullish(),
}

export const ServicesEtAccompagnementValidation = z.object({
  id: z.string().uuid(),
  ...ServicesEtAccompagnementShape,
})

export type ServicesEtAccompagnementData = z.infer<
  typeof ServicesEtAccompagnementValidation
>

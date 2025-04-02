import z from 'zod'
import { modaliteAccompagnementValues } from './modaliteAccompagnement'
import { serviceValues } from './service'

export const ServicesEtAccompagnementShape = {
  services: z.array(z.enum(serviceValues)).nullish(),
  modalitesAccompagnement: z
    .array(z.enum(modaliteAccompagnementValues))
    .nullish(),
}

export const ServicesEtAccompagnementValidation = z.object({
  id: z.string().uuid(),
  ...ServicesEtAccompagnementShape,
})

export type ServicesEtAccompagnementData = z.infer<
  typeof ServicesEtAccompagnementValidation
>

import {
  ModaliteAccompagnement,
  Service,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import z from 'zod'

export const ServicesEtAccompagnementShape = {
  services: z.array(z.nativeEnum(Service)).nullish(),
  modalitesAccompagnement: z
    .array(z.nativeEnum(ModaliteAccompagnement))
    .nullish(),
}

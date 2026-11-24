import {
  ModaliteAccompagnement,
  Service,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import z from 'zod'

export const ServicesEtAccompagnementShape = {
  services: z.array(z.enum(Service)).nullish(),
  modalitesAccompagnement: z.array(z.enum(ModaliteAccompagnement)).nullish(),
}

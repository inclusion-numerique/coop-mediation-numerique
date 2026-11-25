import z from 'zod'
import { FormationLabelPropose } from '@/features/lieux-activite/domain/nomenclatures'
import {
  PresentationDetailSaisi,
  PresentationResumeSaisie,
} from '@/features/lieux-activite/domain/saisie/regles-de-saisie'

export const DescriptionShape = {
  presentationResume: PresentationResumeSaisie,
  presentationDetail: PresentationDetailSaisi,
  formationsLabels: z.array(z.enum(FormationLabelPropose)).nullish(),
}

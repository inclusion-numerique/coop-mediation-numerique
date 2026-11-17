import { FormationLabelPropose } from '@app/web/features/lieux-activite/domain/nomenclatures'
import {
  PresentationDetailSaisi,
  PresentationResumeSaisie,
} from '@app/web/features/lieux-activite/domain/regles-de-saisie'
import z from 'zod'

export const DescriptionShape = {
  presentationResume: PresentationResumeSaisie,
  presentationDetail: PresentationDetailSaisi,
  formationsLabels: z.array(z.enum(FormationLabelPropose)).nullish(),
}

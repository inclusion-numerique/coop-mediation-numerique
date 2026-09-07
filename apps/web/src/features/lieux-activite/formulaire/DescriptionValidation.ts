import { FormationLabelPropose } from '@app/web/features/lieux-activite/domain/nomenclatures'
import {
  PresentationResumeSaisie,
  texteFacultatif,
} from '@app/web/features/lieux-activite/domain/regles-de-saisie'
import z from 'zod'

export const DescriptionShape = {
  presentationResume: PresentationResumeSaisie,
  presentationDetail: texteFacultatif,
  formationsLabels: z.array(z.nativeEnum(FormationLabelPropose)).nullish(),
}

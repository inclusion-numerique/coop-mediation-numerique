import { Pictogram } from '@/libraries/pictograms'
import { SittingAtATableIcon, TeacherIcon } from '@/libraries/pictograms/user'
import { TYPES_D_ACTIVITE } from '../../../domain'

export const typeActiviteValues = TYPES_D_ACTIVITE

export type TypeActivite = (typeof typeActiviteValues)[number]

export const typeActivitePluralLabels: {
  [key in TypeActivite]: string
} = {
  Individuel: 'Accompagnements individuels',
  Collectif: 'Participants aux ateliers',
}

export const typeActiviteLabels: {
  [key in TypeActivite]: string
} = {
  Individuel: 'Accompagnement individuel',
  Collectif: 'Atelier collectif',
}

export const typeActivitePictograms: Record<TypeActivite, Pictogram> = {
  Individuel: SittingAtATableIcon,
  Collectif: TeacherIcon,
}

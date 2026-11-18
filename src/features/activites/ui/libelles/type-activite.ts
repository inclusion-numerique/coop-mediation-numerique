import { Pictogram } from '@/features/pictograms/pictogram'
import { SittingAtATableIcon } from '@/features/pictograms/user/SittingAtATableIcon'
import { TeacherIcon } from '@/features/pictograms/user/TeacherIcon'
import { labelsToOptions } from '@/libraries/ui/components/Form/utils/options'
import { TYPES_D_ACTIVITE } from '../../domain'

export const typeActiviteValues = TYPES_D_ACTIVITE

export type TypeActivite = (typeof typeActiviteValues)[number]

export const typeActivitePluralLabels: {
  [key in TypeActivite]: string
} = {
  Individuel: 'Accompagnements individuels',
  Collectif: 'Participants aux ateliers',
}

export const typeActiviteSlugValues = ['individuel', 'collectif'] as const

export type TypeActiviteSlug = (typeof typeActiviteSlugValues)[number]

export const typeActiviteLabels: {
  [key in TypeActivite]: string
} = {
  Individuel: 'Accompagnement individuel',
  Collectif: 'Atelier collectif',
}

export const typeActiviteForSlug: { [key in TypeActiviteSlug]: TypeActivite } =
  {
    individuel: 'Individuel',
    collectif: 'Collectif',
  }

export const typeActiviteSlugLabels: {
  [key in TypeActiviteSlug]: string
} = {
  individuel: typeActiviteLabels[typeActiviteForSlug.individuel],
  collectif: typeActiviteLabels[typeActiviteForSlug.collectif],
}

export const typeActivitePictograms: Record<TypeActivite, Pictogram> = {
  Individuel: SittingAtATableIcon,
  Collectif: TeacherIcon,
}

export const typeActiviteOptions = labelsToOptions(typeActiviteLabels)

export const typeActiviteSlugOptions = labelsToOptions(typeActiviteSlugLabels)

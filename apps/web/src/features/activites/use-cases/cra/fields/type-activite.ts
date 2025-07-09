import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { Pictogram } from '@app/web/features/pictograms/pictogram'
import { SittingAtATableIcon } from '@app/web/features/pictograms/user/SittingAtATableIcon'
import { TeacherIcon } from '@app/web/features/pictograms/user/TeacherIcon'
import { TypeActivite } from '@prisma/client'

export const typeActivitePluralLabels: {
  [key in TypeActivite]: string
} = {
  Individuel: 'Accompagnements individuels',
  Collectif: 'Ateliers collectifs',
}

export type TypeActiviteSlug = 'individuel' | 'collectif'

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

export const typeActiviteValues = Object.keys(typeActiviteLabels) as [
  TypeActivite,
  ...TypeActivite[],
]

export const typeActiviteOptions = labelsToOptions(typeActiviteLabels)

export const typeActiviteSlugOptions = labelsToOptions(typeActiviteSlugLabels)

export const typeActiviteSlugValues = Object.keys(typeActiviteSlugLabels) as [
  TypeActiviteSlug,
  ...TypeActiviteSlug[],
]

export const typeActiviteApiValues = {
  Individuel: 'individuel',
  Collectif: 'collectif',
} as const satisfies {
  [key in TypeActivite]: string
}

import { CityHallIcon } from '@/features/pictograms/buildings/CityHallIcon'
import { HouseIcon } from '@/features/pictograms/buildings/HouseIcon'
import { SchoolIcon } from '@/features/pictograms/buildings/SchoolIcon'
import { InternetIcon } from '@/features/pictograms/digital/InternetIcon'
import { Pictogram } from '@/features/pictograms/pictogram'
import { labelsToOptions } from '@/libraries/ui/components/Form/utils/options'
import { TYPES_DE_LIEU } from '../../domain'

export const typeLieuValues = TYPES_DE_LIEU

export type TypeLieu = (typeof typeLieuValues)[number]

export const typeLieuLabels: { [key in TypeLieu]: string } = {
  LieuActivite: 'Lieu d’activité',
  Autre: 'Autre lieu',
  Domicile: 'À domicile',
  ADistance: 'À distance',
}

export const typeLieuIllustrations: Record<TypeLieu, Pictogram> = {
  LieuActivite: CityHallIcon,
  Autre: SchoolIcon,
  Domicile: HouseIcon,
  ADistance: InternetIcon,
}

export const typeLieuOptions = labelsToOptions(typeLieuLabels)

export const typeLieuOptionsWithExtras = typeLieuOptions.map(
  ({ label, value }) => ({
    label,
    value,
    extra: {
      illustration: typeLieuIllustrations[value],
    },
  }),
)

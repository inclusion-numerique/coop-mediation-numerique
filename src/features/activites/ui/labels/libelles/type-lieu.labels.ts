import { Pictogram } from '@/libraries/pictograms'
import {
  CityHallIcon,
  HouseIcon,
  SchoolIcon,
} from '@/libraries/pictograms/buildings'
import { InternetIcon } from '@/libraries/pictograms/digital'
import { labelsToOptions } from '@/libraries/ui/form'
import { TYPES_DE_LIEU } from '../../../domain'

export const typeLieuValues = TYPES_DE_LIEU

export type TypeLieu = (typeof typeLieuValues)[number]

export const typeLieuLabels: { [key in TypeLieu]: string } = {
  LieuActivite: 'Lieu d’activité',
  Autre: 'Autre lieu',
  Domicile: 'À domicile',
  ADistance: 'À distance',
}

const typeLieuIllustrations: Record<TypeLieu, Pictogram> = {
  LieuActivite: CityHallIcon,
  Autre: SchoolIcon,
  Domicile: HouseIcon,
  ADistance: InternetIcon,
}

const typeLieuOptions = labelsToOptions(typeLieuLabels)

export const typeLieuOptionsWithExtras = typeLieuOptions.map(
  ({ label, value }) => ({
    label,
    value,
    extra: {
      illustration: typeLieuIllustrations[value],
    },
  }),
)

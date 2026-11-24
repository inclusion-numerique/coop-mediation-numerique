import { CityHallIcon } from '@/libraries/pictograms/buildings/CityHallIcon'
import { HouseIcon } from '@/libraries/pictograms/buildings/HouseIcon'
import { SchoolIcon } from '@/libraries/pictograms/buildings/SchoolIcon'
import { InternetIcon } from '@/libraries/pictograms/digital/InternetIcon'
import { Pictogram } from '@/libraries/pictograms/pictogram'
import { labelsToOptions } from '@/libraries/ui/form/utils/options'
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

import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { CityHallIcon } from '@app/web/features/pictograms/buildings/CityHallIcon'
import { HouseIcon } from '@app/web/features/pictograms/buildings/HouseIcon'
import { SchoolIcon } from '@app/web/features/pictograms/buildings/SchoolIcon'
import { InternetIcon } from '@app/web/features/pictograms/digital/InternetIcon'
import { Pictogram } from '@app/web/features/pictograms/pictogram'
import { TypeLieu } from '@prisma/client'

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

export const typeLieuValues = Object.keys(typeLieuLabels) as [
  TypeLieu,
  ...TypeLieu[],
]

export const typeLieuApiValues = {
  LieuActivite: 'lieu_activite',
  Autre: 'autre',
  Domicile: 'domicile',
  ADistance: 'a_distance',
} as const satisfies {
  [key in TypeLieu]: string
}

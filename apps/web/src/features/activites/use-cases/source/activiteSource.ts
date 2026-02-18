import { labelsToOptions } from '@app/ui/components/Form/utils/options'

export type ActiviteSource = 'v1' | 'v2' | ''

export const activiteSourceLabels: {
  [key in ActiviteSource]: string
} = {
  '': 'Toutes les sources de données',
  v1: 'Espace Coop (V1)',
  v2: 'La Coop de la médiation numérique',
}

export const activiteSourceValues = Object.keys(activiteSourceLabels) as [
  ActiviteSource,
  ...ActiviteSource[],
]

export const activiteSourceOptions = labelsToOptions(activiteSourceLabels)

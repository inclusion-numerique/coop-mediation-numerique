import { labelsToOptions } from '@/libraries/ui/components/Form/utils/options'
import type { ActiviteSource } from '../../domain/filtres-des-activites'

const activiteSourceLabels: {
  [key in ActiviteSource]: string
} = {
  '': 'Toutes les sources de données',
  v1: 'Espace Coop (V1)',
  v2: 'La Coop de la médiation numérique',
}

export const activiteSourceOptions = labelsToOptions(activiteSourceLabels)

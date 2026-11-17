import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { MATERIELS } from '../../domain'

export const materielValues = [...MATERIELS, 'Aucun'] as const

export type Materiel = (typeof materielValues)[number]

export const materielLabels: {
  [key in Materiel]: string
} = {
  Ordinateur: 'Ordinateur',
  Telephone: 'Téléphone',
  Tablette: 'Tablette',
  Autre: 'Autre',
  Aucun: 'Pas de matériel',
}

export const materielIcons: {
  [key in Materiel]: { icon: string; rotation?: number }
} = {
  Ordinateur: { icon: 'ri-computer-line' },
  Telephone: { icon: 'ri-smartphone-line' },
  Tablette: { icon: 'ri-tablet-line', rotation: -90 },
  Autre: { icon: 'ri-remote-control-line' },
  Aucun: { icon: 'ri-loader-fill' },
}

export const materielOptions = labelsToOptions(materielLabels)

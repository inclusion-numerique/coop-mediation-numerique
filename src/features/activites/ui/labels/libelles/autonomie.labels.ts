import { labelsToOptions } from '@/libraries/ui/form/utils/options'
import { AUTONOMIES } from '../../../domain'

export const autonomieValues = AUTONOMIES

export type Autonomie = (typeof autonomieValues)[number]

const autonomieLabels: {
  [key in Autonomie]: string
} = {
  EntierementAccompagne: 'Avec guidage',
  PartiellementAutonome: 'Autonome avec guidage en cas de besoin',
  Autonome: 'Autonome',
}

export const autonomieStars: {
  [key in Autonomie]: number
} = {
  EntierementAccompagne: 1,
  PartiellementAutonome: 2,
  Autonome: 3,
}

const autonomieOptions = labelsToOptions(autonomieLabels)

export const autonomieOptionsWithExtras = autonomieOptions.map(
  ({ label, value }) => ({
    label,
    value,
    extra: {
      stars: autonomieStars[value],
      maxStars: 3,
    },
  }),
)

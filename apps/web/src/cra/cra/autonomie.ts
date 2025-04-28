import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { Autonomie } from '@prisma/client'

export const autonomieLabels: {
  [key in Autonomie]: string
} = {
  EntierementAccompagne: 'Avec guidage',
  PartiellementAutonome: 'Autonome avec guidage en cas de besoin',
  Autonome: 'Autonome',
}

export const autonomieApiValues = {
  EntierementAccompagne: 'entierement_accompagne',
  PartiellementAutonome: 'partiellement_autonome',
  Autonome: 'autonome',
} as const satisfies {
  [key in Autonomie]: string
}

export const autonomieStars: {
  [key in Autonomie]: number
} = {
  EntierementAccompagne: 1,
  PartiellementAutonome: 2,
  Autonome: 3,
}

export const autonomieOptions = labelsToOptions(autonomieLabels)

export const autonomieValues = Object.keys(autonomieLabels) as [
  Autonomie,
  ...Autonomie[],
]

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

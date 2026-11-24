import { labelsToOptions } from '@/libraries/ui/components/form/utils/options'

export const yesNoLabels = {
  yes: 'Oui',
  no: 'Non',
} as const

export const yesOrNo = Object.keys(yesNoLabels) as [keyof typeof yesNoLabels]

export const yesNoBooleanOptions = labelsToOptions(yesNoLabels)

export const booleanToYesNoLabel = (boolean: boolean): string =>
  boolean ? yesNoLabels.yes : yesNoLabels.no

import { genreLabels } from '@/features/beneficiaire/domain/genre'
import { statutSocialLabels } from '@/features/beneficiaire/domain/statut-social'
import { trancheAgeLabels } from '@/features/beneficiaire/domain/tranche-age'
import { labelsToOptions } from '@/libraries/ui'

export const genreOptions = labelsToOptions(genreLabels)
export const statutSocialOptions = labelsToOptions(statutSocialLabels)
export const trancheAgeOptions = labelsToOptions(trancheAgeLabels)
